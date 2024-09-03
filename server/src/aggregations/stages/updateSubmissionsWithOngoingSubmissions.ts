import { OngoingSubmission } from "models";
import { PipelineStage } from "../pipeline";
import { stage as updateInstances } from "./updateInstancesFromSubmissions";
import { stage as updateAlgorithms } from "./updateAlgorithmsFromSubmissions";
import { stage as updateSolutionPaths } from "./updateSolutionPathsFromSubmissions";

/**
 * Aggregation pipeline that groups by unique combination of
 * api key, map id, scenario id, and agent count, and sums up
 * the lower and solution costs. It also selects the latest
 * date from the group. The result is then merged into the
 * submission model.
 *
 * The pipeline is as follows:
 * 1. Filter only valid submissions.
 * 2. Find all submissions with api key with status "submitted".
 * 3. Group by unique combination of api key, map id, scenario id, and agent count.
 * 4. Add algo_id by looking up submission key id.
 * 5. Add instance id by looking up instance id.
 * 6. Merge into submission model.
 */
export const updateSubmissionsWithOngoingSubmissions = () =>
  OngoingSubmission.aggregate(
    [
      {
        $match: {
          "validation.outcome": "valid",
        },
      },
      // Stage 2: Find all submissions with api key with status "submitted"
      {
        $lookup: {
          from: "submission_keys",
          localField: "apiKey",
          foreignField: "api_key",
          as: "apiKeyLookup",
        },
      },
      {
        $match: {
          "apiKeyLookup.status.type": "submitted",
        },
      },
      { $project: { apiKeyLookup: 0 } },
      // Stage 3: Group by unique combination of api key, map id, scenario id, and agent count
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
      // Stage 4: Add algo_id
      {
        $lookup: {
          from: "submission_keys",
          localField: "_id.apiKey",
          foreignField: "api_key",
          // Create algo id from submission key id (not submission key value)
          as: "algo_id",
        },
      },
      {
        $addFields: {
          algo_id: { $arrayElemAt: ["$algo_id._id", 0] },
        },
      },
      // Stage 5: Add instance id
      {
        $lookup: {
          from: "instances",
          localField: "_id.scenarioId",
          foreignField: "scen_id",
          let: {
            mapId: "$_id.mapId",
            agents: "$_id.agentCount",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$map_id", "$$mapId"] },
                    { $eq: ["$agents", "$$agents"] },
                  ],
                },
              },
            },
          ],
          as: "instance_id",
        },
      },
      {
        $addFields: {
          instance_id: { $arrayElemAt: ["$instance_id._id", 0] },
        },
      },
      // Stage 6: Merge into submission model
      {
        $project: {
          _id: 0,
          algo_id: 1,
          map_id: "$_id.mapId",
          lower_cost: 1,
          solution_cost: 1,
          date: "$last_updated",
          agents: "$_id.agentCount",
          scen_id: "$_id.scenarioId",
          instance_id: 1,
        },
      },
      {
        $merge: {
          into: "submissions",
          on: ["algo_id", "map_id", "scen_id", "agents"],
          whenMatched: "merge",
          whenNotMatched: "insert",
        },
      },
    ],
    { allowDiskUse: true }
  );

export const stage: PipelineStage = {
  key: "updateSubmissionsWithOngoingSubmissions",
  run: async () => ({
    result: await updateSubmissionsWithOngoingSubmissions(),
  }),
  dependents: [updateInstances, updateAlgorithms, updateSolutionPaths],
  description: `
Aggregation pipeline that groups by unique combination of
api key, map id, scenario id, and agent count, and sums up
the lower and solution costs. It also selects the latest
date from the group. The result is then merged into the
submission model.

The pipeline is as follows:
1. Filter only valid submissions.
2. Find all submissions with api key with status "submitted".
3. Group by unique combination of api key, map id, scenario id, and agent count.
4. Add algo_id by looking up submission key id.
5. Add instance id by looking up instance id.
6. Merge into submission model.
  `,
};
