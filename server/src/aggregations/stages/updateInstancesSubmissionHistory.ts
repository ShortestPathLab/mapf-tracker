import { Submission } from "models";
import { Expression } from "mongoose";
import { PipelineStage } from "../pipeline";

const SUBMISSIONS = "submissions";
const ALGORITHM = "algorithm";

const reduceHistory = (field: string): Expression.Reduce => ({
  $reduce: {
    input: `$${SUBMISSIONS}`,
    initialValue: {
      current: [],
      current_min: Number.MAX_SAFE_INTEGER,
    },
    in: {
      $cond: {
        if: {
          $and: [
            { $ne: [`$$this.${field}`, null] },
            { $lte: [`$$this.${field}`, { $min: "$$value.current_min" }] },
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
                  value: `$$this.${field}`,
                },
              ],
            ],
          },
          current_min: `$$this.${field}`,
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
          algo_name: { $arrayElemAt: [`$${ALGORITHM}.algo_name`, 0] },
        },
      },
      { $project: { [ALGORITHM]: 0 } },
      // Stage 1.1: Group by instance_id
      {
        $group: {
          _id: "$instance_id",
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
          lower_algos: reduceHistory("lower_cost"),
          solution_algos: reduceHistory("solution_cost"),
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
          whenNotMatched: "fail",
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
