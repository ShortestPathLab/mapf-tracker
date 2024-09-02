import { Instance } from "models";
import { PipelineStage } from "../pipeline";
import { stage as updateScenarios } from "./updateScenariosFromInstances";
import { Expression } from "mongoose";

const SUBMISSIONS = "submissions";

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
          $lt: [`$$this.${field}`, { $min: "$$value.current_min" }],
        },
        then: {
          current: {
            $concatArrays: [
              "$$value",
              [
                {
                  algo_id: "$$this.algo_id",
                  date: "$$this.date",
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

export const updateInstancesSubmissionHistoryFromSubmissions = () =>
  Instance.aggregate([
    // Stage 1: Lookup submissions for each instance
    {
      $lookup: {
        from: "submissions",
        localField: "_id",
        foreignField: "instance_id",
        as: SUBMISSIONS,
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
  ]);

export const stage: PipelineStage = {
  key: "updateInstancesSubmissionHistoryFromSubmissions",
  run: async () => ({
    result: await updateInstancesSubmissionHistoryFromSubmissions(),
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
