import { Elysia } from "elysia";
import { Scenario } from "models";

/**
 * Wire shape for a scenario record as serialised to clients. Mirrors the
 * client's `core/types` `Scenario` type (plus the computed `map_name`/
 * `map_type` and the toJSON-added `id`) so Eden Treaty infers real types.
 */
export type ScenarioRecord = {
  _id: string;
  id: string;
  map_id: string;
  type_id: number;
  scen_type: string;
  map_name: string;
  map_type: string;
  instances: number;
  instances_closed: number;
  instances_solved: number;
};

/**
 * Native Elysia routes for the scenario cluster. Arrays of documents serialise
 * as JSON directly (applying the model's toJSON transform, which adds `id`);
 * single documents are converted with toJSON for the same reason. A missing
 * single scenario returns 404 (the previous bridged handler returned an empty
 * 200 body, which clients already treated as an error). Static path segments
 * (`/map`, `/id`) take precedence over `/:id` in Elysia's router.
 */
export const scenarioRoutes = new Elysia({ prefix: "/api/scenario" })
  .get("/", async () => (await Scenario.find({})) as unknown as ScenarioRecord[])
  .get(
    "/map/:id",
    async ({ params }) =>
      (await Scenario.find({ map_id: params.id }).sort({
        scen_type: 1,
        type_id: 1,
      })) as unknown as ScenarioRecord[],
  )
  .get(
    "/map/:id/:scen_type",
    async ({ params }) =>
      (await Scenario.find({
        map_id: params.id,
        scen_type: params.scen_type,
      })) as unknown as ScenarioRecord[],
  )
  .get("/id/:id", async ({ params, status }) => {
    const data = await Scenario.findById(params.id);
    if (!data) return status(404, { message: `Not found Scenario with id ${params.id}` });
    return data.toJSON() as ScenarioRecord;
  })
  .get("/:id", async ({ params, status }) => {
    const data = await Scenario.findById(params.id);
    if (!data) return status(404, { message: `Not found Scenario with id ${params.id}` });
    return data.toJSON() as ScenarioRecord;
  });
