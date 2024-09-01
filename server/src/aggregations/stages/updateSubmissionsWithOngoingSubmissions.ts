import { OngoingSubmission } from "models";
import { PipelineStage } from "../pipeline";
import { stage as updateInstances } from "./updateInstancesFromSubmissions";
import { stage as updateAlgorithms } from "./updateAlgorithmsFromSubmissions";
import { stage as updateSolutionPaths } from "./updateSolutionPathsFromSubmissions";

/**
 * Periodically run aggregation pipeline to update submission model
 * with total lower/solution costs and last updated date.
 *
 * This aggregation pipeline groups by unique combination of
 * api key, map id, scenario id, and agent count, and sums up
 * the lower and solution costs. It also selects the latest
 * date from the group. The result is then merged into the
 * submission model.
 */

export const updateSubmissionsWithOngoingSubmissions = () =>
  OngoingSubmission.aggregate([
    {
      $match: {
        "validation.outcome": "valid",
      },
    },
    {
      $group: {
        _id: {
          apiKey: "$apiKey",
          mapId: "$mapId",
          scenarioId: "$scenarioId",
          agentCount: "$agentCountIntent",
        },
        lower_cost: {
          $sum: "$lowerCost",
        },
        solution_cost: {
          $sum: "$solutionCost",
        },
        last_updated: {
          $max: "$updatedAt",
        },
      },
    },
    {
      $project: {
        _id: 0,
        apiKey: "$_id.apiKey",
        map_id: "$_id.mapId",
        lower_cost: 1,
        solution_cost: 1,
        date: "$last_updated",
        agents: "$_id.agentCount",
        scen_id: "$_id.scenarioId",
      },
    },
    {
      $merge: {
        into: "submissions",
        on: ["apiKey", "map_id", "scen_id", "agents"],
        whenMatched: "merge",
        whenNotMatched: "insert",
      },
    },
  ]);

export const stage: PipelineStage = {
  key: "updateSubmissionsWithOngoingSubmissions",
  run: async () => ({
    result: await updateSubmissionsWithOngoingSubmissions(),
  }),
  dependents: [updateInstances, updateAlgorithms, updateSolutionPaths],
};
