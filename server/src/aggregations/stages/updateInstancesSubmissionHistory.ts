import { Submission } from "models";
import { Expression } from "mongoose";
import { PipelineStage } from "../pipeline";

const SUBMISSIONS = "submissions";
const ALGORITHM = "algorithm";

const variants = {
  min: { cond: "$lte", op: "$min", init: Number.MAX_SAFE_INTEGER },
  max: { cond: "$gte", op: "$max", init: Number.MIN_SAFE_INTEGER },
};

const reduceHistory = (
  field: string,
  variant: (typeof variants)[keyof typeof variants]
): Expression.Reduce => ({
  $reduce: {
    input: `$${SUBMISSIONS}`,
    initialValue: {
      current: [],
      current_best: variant.init,
    },
    in: {
      $cond: {
        if: {
          $and: [
            { $ne: [`$$this.${field}`, null] },
            {
              [variant.cond]: [
                `$$this.${field}`,
                { [variant.op]: "$$value.current_best" },
              ],
            },
          ],
        },
        then: {
          current: {
            $concatArrays: [
              "$$value.current",
              [
                {
                  algo_name: `$$this.algo_name`,
                  algo_id: `$$this.algo_id`,
                  date: "$$this.date",
                  submission_id: `$$this._id`,
                  value: `$$this.${field}`,
                },
              ],
            ],
          },
          current_best: `$$this.${field}`,
        },
        else: "$$value",
      },
    },
  },
});

const sortByDate = () => {
  return {
    $sortArray: {
      input: `$${SUBMISSIONS}`,
      sortBy: { date: 1 },
    },
  };
};

export const updateInstancesSubmissionHistory = () =>
  Submission.aggregate(
    [
      // Stage 1: Lookup submissions for each instance
      {
        $lookup: {
          from: "algorithms",
          localField: "algo_id",
          foreignField: "_id",
          as: ALGORITHM,
        },
      },
      {
        $addFields: {
          algo_name: { $first: `$${ALGORITHM}.algo_name` },
        },
      },
      { $project: { [ALGORITHM]: 0 } },
      // Stage 1.1: Group by instance_id
      {
        $group: {
          _id: "$instance_id",
          map_id: { $first: "$map_id" },
          scen_id: { $first: "$scen_id" },
          agents: { $first: "$agents" },
          [SUBMISSIONS]: { $push: "$$ROOT" },
        },
      },
      // Stage 2: Sort submissions by date
      {
        $addFields: {
          [SUBMISSIONS]: sortByDate(),
        },
      },
      // Stage 3: Add fields for lower and solution algorithms
      {
        $addFields: {
          lower_algos: reduceHistory("lower_cost", variants.min),
          solution_algos: reduceHistory("solution_cost", variants.max),
        },
      },
      {
        $addFields: {
          lower_algos: `$lower_algos.current`,
          solution_algos: `$solution_algos.current`,
        },
      },
      // Stage 4: Project the result to remove the submissions array from the output
      {
        $project: {
          [SUBMISSIONS]: 0,
        },
      },
      // Stage 5: Merge the result into the Instances collection
      {
        $merge: {
          into: "instances",
          whenMatched: "merge",
          whenNotMatched: "discard",
        },
      },
    ],
    { allowDiskUse: true }
  );

export const stage: PipelineStage = {
  key: "updateInstancesSubmissionHistory",
  run: async () => ({
    result: await updateInstancesSubmissionHistory(),
  }),
  dependents: [],
  description: `
This pipeline aggregates all submissions for each instance and updates the
instance model with the following information:
- lower_algos: The submissions that at one point held the best lower bound.
- solution_algos: The submissions that at one point held the best solution.

The result is written back to the Instances collection.
`,
};
