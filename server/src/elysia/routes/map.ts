import { Elysia } from "elysia";
import { Map } from "models";
import { makespan, preview } from "../../controllers/map";

/**
 * Wire shape for a map record as serialised to clients. Mirrors the client's
 * `core/types` `Map` type so Eden Treaty infers real end-to-end types instead
 * of bridged legacy ones. `id` is added by the model's toJSON transform and
 * `original_link`/`papers` are present on stored documents.
 */
export type MapRecord = {
  _id: string;
  id: string;
  map_name: string;
  map_size: string;
  map_type: string;
  scens: number;
  instances: number;
  instances_closed: number;
  instances_solved: number;
  proportion_instances_closed: number;
  proportion_instances_solved: number;
  original_link?: string;
  papers?: string;
};

/**
 * Native Elysia routes for the map cluster. Documents are returned as-is so
 * the model's toJSON transform (which adds `id`) still applies on
 * serialisation, keeping the wire output identical to the previous
 * Express-bridged handlers; the cast supplies the clean type to Eden.
 */
export const mapRoutes = new Elysia({ prefix: "/api/map" })
  .get(
    "/",
    async () =>
      (await Map.find({}).sort({ map_type: 1 })) as unknown as MapRecord[],
  )
  .get("/:id", async ({ params, status }) => {
    const data = await Map.findById(params.id);
    if (!data) return status(404, { message: `Not found Map with id ${params.id}` });
    // Serialise to a plain object (applying the model's toJSON transform, which
    // adds `id`). Elysia renders a bare Mongoose document as text/plain rather
    // than JSON, so the conversion is required for a single-document response.
    return data.toJSON() as MapRecord;
  })
  .post("/preview", preview)
  .post("/makespan", makespan);
