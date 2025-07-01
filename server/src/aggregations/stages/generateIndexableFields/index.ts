import { Instance, Scenario, Submission } from "models";
import { hideFields } from "mongodb-aggregate-builder";
import { PipelineStage } from "../../pipeline";
import { stage as invalidateQueryCache } from "../invalidateQueryCache";

async function generateIndexableFields() {
  await Scenario.aggregate([
    {
      $lookup: {
        from: "maps",
        localField: "map_id",
        foreignField: "_id",
        as: "map",
      },
    },
    {
      $addFields: {
        map_name: { $first: "$map.map_name" },
        map_type: { $first: "$map.map_type" },
      },
    },
    {
      $project: hideFields(["map"]),
    },
    {
      $merge: {
        into: "scenarios",
        whenMatched: "merge",
        whenNotMatched: "fail",
      },
    },
  ]);
  await Instance.aggregate([
    {
      $lookup: {
        from: "scenarios",
        localField: "scen_id",
        foreignField: "_id",
        as: "scenario",
      },
    },

    {
      $addFields: {
        scenario_type: { $first: "$scenario.scen_type" },
        scenario_type_id: { $first: "$scenario.type_id" },
        map_id: { $first: "$scenario.map_id" },
        map_name: { $first: "$scenario.map_name" },
        map_type: { $first: "$scenario.map_type" },
      },
    },
    {
      $project: hideFields(["scenario"]),
    },
    {
      $merge: {
        into: "instances",
        whenMatched: "merge",
        whenNotMatched: "fail",
      },
    },
  ]);
  await Submission.aggregate([
    {
      $lookup: {
        from: "instances",
        localField: "instance_id",
        foreignField: "_id",
        as: "instance",
      },
    },
    {
      $addFields: {
        map_id: { $first: "$instance.map_id" },
        map_name: { $first: "$instance.map_name" },
        map_type: { $first: "$instance.map_type" },
        scenario_id: { $first: "$instance.scen_id" },
        scenario_type: { $first: "$instance.scenario_type" },
        scenario_type_id: { $first: "$instance.scenario_type_id" },
        agents: { $first: "$instance.agents" },
      },
    },
    {
      $project: hideFields(["instance"]),
    },
    {
      $merge: {
        into: "submissions",
        whenMatched: "merge",
        whenNotMatched: "fail",
      },
    },
  ]);
}

export const stage: PipelineStage = {
  key: "generateIndexableFields",
  run: async () => ({
    result: await generateIndexableFields(),
  }),
  dependents: [invalidateQueryCache],
  description: () => `
  Generates indexable fields for scenarios, instances, and submissions. This is useful for improving query performance and ensuring that the necessary fields are available for indexing.
  `,
};
