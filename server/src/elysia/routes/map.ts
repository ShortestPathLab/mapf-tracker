import type { Context } from "elysia";
import { Elysia } from "elysia";
import { Instance, Map, SolutionPath } from "models";
import { cached } from "query";
import { handler as createPreviewAsync } from "workers/createPreview.worker";
import { handler as makespanAsync, type MakespanData } from "workers/computeMakespan.worker";
import { allToJSON, toJSON } from "utils/toJSON";
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
 * Native Elysia routes for the map cluster. Documents are serialised with the
 * house `toJSON`/`allToJSON` helpers, which apply the model's toJSON transform
 * (adding `id`) and give Eden the real wire type end-to-end. The single-document
 * conversion is also required because Elysia renders a bare Mongoose document as
 * text/plain rather than JSON.
 */
export const mapRoutes = new Elysia({ prefix: "/api/map" })
  .get("/", () => Map.find({}).sort({ map_type: 1 }).then(allToJSON))
  .get("/:id", async ({ params, status }) => {
    const data = await Map.findById(params.id);
    if (!data) return status(404, { message: `Not found Map with id ${params.id}` });
    return toJSON(data);
  })
  .post("/preview", preview)
  .post("/makespan", makespan);
