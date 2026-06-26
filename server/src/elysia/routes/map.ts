import type { Context } from "elysia";
import { Elysia } from "elysia";
import { Instance, Map, SolutionPath } from "models";
import { get } from "models/Version";
import { cached } from "query";
import { diskCached } from "query/withDiskCache";
import { getSolutionPath } from "utils/solutionPath";
import { handler as createPreviewAsync } from "workers/createPreview.worker";
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

// The makespan is a pure function of the solution path it resolves to, so both
// cache layers key on the single resolved id (`solutionPath ?? instance`)
// rather than the raw body. This keeps the key canonical regardless of body
// shape/ordering, so a precomputed entry is hit verbatim by the live request.
const makespanKey = (ctx: Context) => {
  const { instance, solutionPath } = (ctx.body ?? {}) as {
    instance?: string;
    solutionPath?: string;
  };
  return solutionPath ?? instance ?? "";
};

const computeMakespan = async (ctx: Context): Promise<number | null> => {
  const id = makespanKey(ctx);
  if (!id) return null;
  const paths = await getSolutionPath(id, "submitted");
  if (!paths) return null;
  return Math.max(0, ...paths.map((path) => path.replace(/\r$/, "").length));
};

const makespan = cached(
  diskCached("map-makespan", computeMakespan, {
    resolver: makespanKey,
    invalidationKey: () => get("diskCache"),
    // Warm one entry per instance, matching the `{ instance, solutionPath }`
    // body the client sends (see `useMakespanData`). Both fields are included
    // so the warmed key matches whether or not the instance has a solution.
    precompute: async () => {
      const instances = await Instance.find({}, { _id: 1, solution_path_id: 1 });
      return instances.map((i) => [
        {
          body: {
            instance: i._id.toString(),
            solutionPath: i.solution_path_id?.toString(),
          },
        } as Context,
      ]);
    },
  }) as (ctx: Context) => Promise<number | null>,
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
