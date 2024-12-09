import { OngoingSubmission } from "models";
import { PipelineStage } from "../pipeline";
import { stage as updateInstances } from "./updateInstancesFromSubmissions";
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
      {
        $addFields: {
          lower_cost: "$lowerBound",
          solution_cost: "$cost",
          last_updated: {
            $max: "$updatedAt",
          },
        },
      },
      {
        $lookup: {
          from: "instances",
          localField: "instance",
          foreignField: "_id",
          as: "instanceData",
        },
      },
      {
        $addFields: {
          algo_id: {
            $arrayElemAt: ["$algo_id._id", 0],
          },
          agents: "$instanceData.agents",
        },
      },
      {
        $addFields: {
          instance_id: "$instance",
        },
      },
      {
        $project: {
          lower_cost: "$lowerBound",
          solution_cost: "$cost",
          map_id: { $first: "$instanceData.map_id" },
          scen_id: { $first: "$instanceData.scen_id" },
          agents: { $first: "$instanceData.agents" },
          instance_id: "$instance",
          algo_id: { $first: "$apiKeyLookup._id" },
          date: "$last_updated",
          solutions: "$solutions",
          _id: 0,
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
  dependents: [updateInstances, updateSolutionPaths],
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
