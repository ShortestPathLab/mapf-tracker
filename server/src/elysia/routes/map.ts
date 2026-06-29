import type { Context } from "elysia";
import { Elysia } from "elysia";
import { Instance, Map, SolutionPath } from "models";
import { cached } from "query";
import { handler as createPreviewAsync } from "workers/createPreview.worker";
import { handler as makespanAsync, type MakespanData } from "workers/computeMakespan.worker";
import z from "zod";

// `createPreviewAsync` resolves a rendered SVG string, but the disk-cache
// wrapper's multi-path return widens its type, so assert the wire shape here so
// Eden infers `string` end-to-end.
const preview = async ({ body }: Context): Promise<string> =>
  (await createPreviewAsync!(
    z
      .object({
        map: z.string().optional(),
        instance: z.string().optional(),
        scenario: z.string().optional(),
      })
      .parse(body),
  )) as string;

// The makespan is a pure function of the solution path it resolves to, so the
// in-memory cache keys on the single resolved id (`solutionPath ?? instance`)
// rather than the raw body, matching the disk cache's resolver in the worker.
// This keeps the key canonical regardless of body shape/ordering.
const makespanBody = (ctx: Context): MakespanData => {
  const { instance, solutionPath } = (ctx.body ?? {}) as MakespanData;
  return { instance, solutionPath };
};

const makespanKey = (ctx: Context) => {
  const { instance, solutionPath } = makespanBody(ctx);
  return solutionPath ?? instance ?? "";
};

// The heavy compute (disk-cache miss and precompute warming) runs in
// `computeMakespan.worker`, mirroring the preview worker; this in-memory layer
// just shields the warm disk cache from repeat live hits.
const makespan = cached(
  async (ctx: Context): Promise<number | null> =>
    (await makespanAsync!(makespanBody(ctx))) as number | null,
  { watch: [Instance, SolutionPath], cacheKey: makespanKey },
);

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
  .get("/", async () => (await Map.find({}).sort({ map_type: 1 })) as unknown as MapRecord[])
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
