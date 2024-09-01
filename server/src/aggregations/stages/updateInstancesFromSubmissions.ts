import { Instance } from "models";
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
          $min: "$submissions.lower_cost",
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
  dependents: [updateScenarios],
};
