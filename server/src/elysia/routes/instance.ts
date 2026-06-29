import { Elysia } from "elysia";
import { sortBy } from "lodash";
import { Infer, Instance, Scenario } from "models";
import { Types } from "mongoose";
import { allToJSON, toJSON } from "utils/toJSON";

/** A per-agent-count instance summary for a scenario (`/:id`). */
type InstanceSummary = {
  id: string;
  agents: number;
  solution_path_id?: string;
  lower_algos: number;
  lower_date?: string;
  lower_cost?: number;
  solution_algos: number;
  solution_date?: string;
  solution_cost?: number;
  closed: boolean;
  empty: boolean;
};

/** A flattened instance + solution-path row for CSV download (`/DownloadRow/:id`). */
type DownloadRow = {
  agents: number;
  lower_cost?: number;
  lower_date?: string;
  solution_cost?: number;
  solution_date?: string;
  path?: string;
};

/** A per-scenario instance row for the map-level CSV download (`/DownloadMapByID/:id`). */
type DownloadMapRow = {
  scen_type?: string;
  type_id?: number;
  agents?: number;
  lower_cost?: number;
  lower_date?: string;
  solution_cost?: number;
  solution_date?: string;
};

// Static segments registered before the dynamic `/:id` so they aren't shadowed.
export const instanceRoutes = new Elysia({ prefix: "/api/instance" })
  .get("/id/:id", ({ params }) => Instance.findById(params.id).then(toJSON))
  .get("/getAlgo/:id", ({ params }) =>
    Instance.find({ _id: params.id }, { lower_algos: 1, solution_algos: 1 }).then(allToJSON),
  )
  .get(
    "/DownloadRow/:id",
    ({ params }) =>
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
      ]) as Promise<DownloadRow[]>,
  )
  .get("/DownloadInstance/:id", ({ params }) =>
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
    )
      .sort({ agents: 1 })
      .then(allToJSON),
  )
  .get("/DownloadMapByID/:id", async ({ params }) => {
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
    const rows: DownloadMapRow[] = data.map((row) => ({
      scen_type: row.scen_id.scen_type,
      type_id: row.scen_id.type_id,
      agents: row.agents,
      lower_cost: row.lower_cost,
      lower_date: row.lower_date,
      solution_cost: row.solution_cost,
      solution_date: row.solution_date,
    }));
    // Ascending by scenario type, then type id, then agent count.
    return sortBy(rows, ["scen_type", "type_id", "agents"]);
  })
  .get(
    "/:id",
    ({ params }) =>
      Instance.aggregate([
        { $match: { scen_id: new Types.ObjectId(params.id) } },
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
              $and: [{ $ne: ["$lower_cost", null] }, { $eq: ["$lower_cost", "$solution_cost"] }],
            },
            empty: { $eq: ["$solution_algos", 0] },
          },
        },
        { $sort: { agents: 1 } },
      ]) as Promise<InstanceSummary[]>,
  );
