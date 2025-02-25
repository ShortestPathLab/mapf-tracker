import { Scenario } from "models";
import { PipelineStage } from "../pipeline";
import { stage as updateMaps } from "./updateMapsFromScenarios";

export const isClosedCond = (solution: string, lower: string) => ({
  $and: [
    { $ne: [solution, null] },
    {
      $eq: [solution, lower],
    },
  ],
});

export const isSolvedCond = (solution: string) => ({ $ne: [solution, null] });

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
              cond: isClosedCond(
                "$$instance.solution_cost",
                "$$instance.lower_cost"
              ),
            },
          },
        },
        instances_solved: {
          $size: {
            $filter: {
              input: "$instances",
              as: "instance",
              cond: isSolvedCond("$$instance.solution_cost"),
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
