///@ts-nocheck This file is bonkers

import type { Context } from "elysia";
import { Elysia } from "elysia";
import { first } from "lodash";
import { Infer, Instance, Scenario } from "models";
import { Types } from "mongoose";
import { queryClient } from "query";

const { query } = queryClient(Instance);

const findById = query(
  ({ params }) => [{ _id: new Types.ObjectId(params.id) }],
  async (docs) => first(docs)?.toJSON(),
);

const findAll = async () => Instance.find({});

const findNonEmptyByScenId = async ({ params }: Context) =>
  Instance.aggregate([
    {
      $match: { scen_id: new Types.ObjectId(params.id) },
    },
    {
      $project: {
        id: "$_id",
        agents: 1,
        solution_path_id: 1,
        lower_algos: { $size: "$lower_algos" },
        lower_date: { $last: "$lower_algos.date" },
        lower_cost: { $last: "$lower_algos.value" },
        solution_algos: { $size: "$solution_algos" },
        solution_date: { $last: "$solution_algos.date" },
        solution_cost: { $last: "$solution_algos.value" },
      },
    },
    {
      $addFields: {
        closed: {
          $and: [
            { $ne: ["$lower_cost", null] },
            { $eq: ["$lower_cost", "$solution_cost"] },
          ],
        },
        empty: { $eq: ["$solution_algos", 0] },
      },
    },
    { $sort: { agents: 1 } },
  ]);

const findAlgosRecord = async ({ params }: Context) =>
  Instance.find({ _id: params.id }, { lower_algos: 1, solution_algos: 1 });

function rankingSorter(firstKey, secondKey, thirdKey) {
  return (a, b) => {
    if (a[firstKey] > b[firstKey]) {
      return 1;
    } else if (a[firstKey] < b[firstKey]) {
      return -1;
    } else {
      if (a[secondKey] > b[secondKey]) {
        return 1;
      } else if (a[secondKey] < b[secondKey]) {
        return -1;
      } else {
        if (a[thirdKey] > b[thirdKey]) {
          return 1;
        } else if (a[thirdKey] < b[thirdKey]) {
          return -1;
        } else {
          return 0;
        }
      }
    }
  };
}

const downloadMapByID = async ({ params }: Context) => {
  const data = await Instance.find(
    { map_id: params.id, empty: false },
    {
      map_id: 1,
      scen_id: 1,
      agents: 1,
      lower_cost: 1,
      lower_date: 1,
      solution_cost: 1,
      solution_date: 1,
    },
  ).populate<{ scen_id: Infer<typeof Scenario> }>("scen_id", {
    scen_type: 1,
    type_id: 1,
    _id: 0,
  });
  const transformedDataArray = data.map((row) => ({
    scen_type: row.scen_id.scen_type,
    type_id: row.scen_id.type_id,
    agents: row.agents,
    lower_cost: row.lower_cost,
    lower_date: row.lower_date,
    solution_cost: row.solution_cost,
    solution_date: row.solution_date,
  }));
  transformedDataArray.sort(rankingSorter("scen_type", "type_id", "agents"));
  return transformedDataArray;
};

const downloadNonEmptyByScenId = async ({ params }: Context) =>
  Instance.find(
    { scen_id: params.id, empty: false },
    {
      agents: 1,
      lower_cost: 1,
      lower_date: 1,
      solution_cost: 1,
      solution_date: 1,
      _id: 0,
    },
  ).sort({ agents: 1 });

const downloadRowById = async ({ params }: Context) =>
  Instance.aggregate([
    { $match: { _id: new Types.ObjectId(params.id) } },
    {
      $lookup: {
        from: "solution_paths",
        localField: "solution_path_id",
        foreignField: "_id",
        as: "path_info",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$path_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $project: {
        agents: 1,
        lower_cost: 1,
        lower_date: 1,
        solution_cost: 1,
        solution_date: 1,
        path: "$solution_path",
        _id: 0,
      },
    },
  ]);

// Static segments registered before the dynamic `/:id` so they aren't shadowed.
export const instanceRoutes = new Elysia({ prefix: "/api/instance" })
  .get("/", findAll)
  .get("/id/:id", findById)
  .get("/getAlgo/:id", findAlgosRecord)
  .get("/DownloadRow/:id", downloadRowById)
  .get("/DownloadInstance/:id", downloadNonEmptyByScenId)
  .get("/DownloadMapByID/:id", downloadMapByID)
  .get("/:id", findNonEmptyByScenId);
