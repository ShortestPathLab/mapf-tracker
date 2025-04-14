import { Instance } from "models";
import { stage as updateAlgorithms } from "./updateAlgorithmsFromSubmissions";
import { PipelineStage } from "../pipeline";
import { stage as updateScenarios } from "./updateScenariosFromInstances";

/**
 * Updates the best_lower and best_solution fields in each instance with the
 * current best results from the submissions collection.
 *
 * @returns The aggregation pipeline to update the instances collection.
 */
export const updateInstancesFromSubmissions = () =>
  Instance.aggregate([
    //TODO: Add a filter for only running this for specified subset of submissions
    {
      $lookup: {
        from: "submissions",
        localField: "_id",
        foreignField: "instance_id",
        as: "submissions",
      },
    },
    {
      $addFields: {
        lower_cost: {
          $max: "$submissions.lower_cost",
        },
        solution_cost: {
          $min: "$submissions.solution_cost",
        },
      },
    },
    {
      $project: {
        submissions: 0, // Remove the submissions array from the output
      },
    },
    {
      $merge: {
        into: "instances",
        whenMatched: "merge",
        whenNotMatched: "fail",
      },
    },
  ]);

export const stage: PipelineStage = {
  key: "updateInstancesFromSubmissions",
  run: async () => ({ result: await updateInstancesFromSubmissions() }),
  dependents: [updateScenarios, updateAlgorithms],
  description: () => `
This pipeline aggregates all submissions for each instance and updates the
instance model with the best lower and solution costs.

The result is written back to the Instances collection.

The pipeline is as follows:
1. Look up all submissions for each instance and add them to the submissions array.
2. Unwind the submissions array so that each submission becomes a separate document.
3. Add fields for the best lower and solution costs.
4. Project the result to remove the submissions array from the output.
5. Merge the result into the Instances collection.
  `,
};
