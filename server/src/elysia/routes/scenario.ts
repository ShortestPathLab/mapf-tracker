import { Elysia } from "elysia";
import { Scenario } from "models";
import { allToJSON, toJSON } from "utils/toJSON";

/**
 * Native Elysia routes for the scenario cluster. Documents are serialised with
 * the house `toJSON`/`allToJSON` helpers, which apply the model's toJSON
 * transform (adding `id`) and give Eden the real wire type end-to-end. A
 * missing single scenario returns 404 (the previous bridged handler returned an
 * empty 200 body, which clients already treated as an error). Static path
 * segments (`/map`, `/id`) take precedence over `/:id` in Elysia's router.
 */
export const scenarioRoutes = new Elysia({ prefix: "/api/scenario" })
  .get("/", () => Scenario.find({}).then(allToJSON))
  .get("/map/:id", ({ params }) =>
    Scenario.find({ map_id: params.id }).sort({ scen_type: 1, type_id: 1 }).then(allToJSON),
  )
  .get("/map/:id/:scen_type", ({ params }) =>
    Scenario.find({ map_id: params.id, scen_type: params.scen_type }).then(allToJSON),
  )
  .get("/id/:id", async ({ params, status }) => {
    const data = await Scenario.findById(params.id);
    if (!data) return status(404, { message: `Not found Scenario with id ${params.id}` });
    return toJSON(data);
  })
  .get("/:id", async ({ params, status }) => {
    const data = await Scenario.findById(params.id);
    if (!data) return status(404, { message: `Not found Scenario with id ${params.id}` });
    return toJSON(data);
  });
