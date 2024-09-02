import { Scenario } from "models";
import { PipelineStage } from "../pipeline";
import { stage as updateMaps } from "./updateMapsFromScenarios";

/**
 * Updates the scenario documents with the number of closed and solved instances.
 * The result is written back to the Scenarios collection.
 *
 * @returns The update aggregation pipeline.
 */

export const updateScenariosFromInstances = () =>
  Scenario.aggregate([
    {
      $lookup: {
        from: "instances",
        localField: "_id",
        foreignField: "scen_id",
        as: "instances",
      },
    },
    {
      $addFields: {
        instances_closed: {
          $size: {
            $filter: {
              input: "$instances",
              as: "instance",
              cond: { $eq: ["$$instance.closed", true] },
            },
          },
        },
        instances_solved: {
          $size: {
            $filter: {
              input: "$instances",
              as: "instance",
              cond: { $ne: ["$$instance.solution_cost", null] },
            },
          },
        },
        instances: {
          $size: "$instances",
        },
      },
    },
    {
      $merge: {
        into: "scenarios",
        whenMatched: "merge",
        whenNotMatched: "fail",
      },
    },
  ]);

export const stage: PipelineStage = {
  key: "updateScenariosFromInstances",
  run: async () => ({ result: await updateScenariosFromInstances() }),
  dependents: [updateMaps],
};
