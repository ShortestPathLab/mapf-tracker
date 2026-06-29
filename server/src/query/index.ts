import { Elysia, type Context } from "elysia";
import { debounce } from "lodash";
import { get } from "models/Version";
import { AggregateBuilder } from "mongodb-aggregate-builder";
import { Document, FilterQuery, Model, ProjectionType, Types } from "mongoose";
import hash from "object-hash";
import memo, { AnyAsyncFunction } from "p-memoize";
import QuickLRU, { Options } from "quick-lru";
import { allToJSON, toJSON } from "utils/toJSON";
import { diskCached } from "./withDiskCache";

export const toJson = (r: Response) => r.json();
export const toBlob = (r: Response) => r.blob();
export const toText = (r: Response) => r.text();

export const json = <T>(p: string) => fetch(p).then(toJson) as Promise<T>;
export const text = (p: string) => fetch(p).then(toText);
export const blob = (p: string) => fetch(p).then(toBlob);

export const createCache = <T extends AnyAsyncFunction>(
  f: T,
  opts: Options<string, Awaited<ReturnType<T>>> = {
    maxSize: 1000,
  },
) => {
  const cache = new QuickLRU<string, Awaited<ReturnType<T>>>(opts);
  const g = memo(f, {
    cache,
    cacheKey: ([a]) => hash(a ?? ""),
  });
  return [g, cache] as const;
};

/** Derives the cache key (an object to be hashed) from the request context. */
export type CacheKey = (ctx: Context) => unknown;

export type CachedOptions = {
  /** Collections whose changes clear this cache. */
  watch?: Model<any>[];
  /** Maps the context to the value hashed for the cache key (default: params). */
  cacheKey?: CacheKey;
} & Partial<Options<string, any>>;

/**
 * Wraps an Elysia handler with an in-memory LRU cache. The handler's return
 * type is preserved so Eden still infers the response type end-to-end. The
 * cache is keyed by `hash(cacheKey(ctx))` and cleared (debounced) whenever any
 * watched collection changes.
 */
export function cached<Fn extends (ctx: any) => Promise<unknown>>(
  handler: Fn,
  {
    watch = [],
    cacheKey = (ctx) => (ctx as Context).params,
    maxSize = 1000,
    ...rest
  }: CachedOptions = {},
): Fn {
  const cache = new QuickLRU<string, Awaited<ReturnType<Fn>>>({
    maxSize,
    ...rest,
  });
  const clear = debounce(() => cache.clear(), 1000);
  for (const w of watch) {
    w.watch().on("change", clear);
  }
  const g = memo(handler as any, {
    cache,
    // Stringify first: the Elysia context's params/body are not always
    // structurally hashable by object-hash directly.
    cacheKey: ([ctx]: any[]) => hash(JSON.stringify(cacheKey(ctx as Context) ?? "")),
  });
  // Elysia statically analyses the handler source to decide which context
  // fields to parse. The memoized fn hides that, so explicitly reference
  // query/params/body/headers here to force Elysia to populate them.
  return ((ctx: any) => {
    void ctx.query;
    void ctx.params;
    void ctx.body;
    void ctx.headers;
    return g(ctx);
  }) as unknown as Fn;
}

export type AggregateOptions<R> = {
  /** Enables disk caching under this name. */
  name?: string;
  /** Transforms the raw aggregation result before returning. */
  handler?: (docs: any, ctx: Context) => Promise<R>;
  /**
   * Cache-warming list. Returns the request contexts to precompute (and store
   * to disk) whenever the data version changes — e.g. after the aggregation
   * pipeline runs or on start with `PRECOMPUTE_ON_START=1`. Each context is run
   * through the same `agg`/`cacheKey` path as a live request, so a warmed entry
   * is hit verbatim by the matching request. Requires `name` (disk caching).
   */
  precompute?: () => Promise<Partial<Context>[]>;
} & CachedOptions;

export const queryClient = <T>(model: Model<T>) => {
  return {
    /** A `model.find`-backed, cached Elysia handler. */
    query: (
      buildQuery: (ctx: Context) => [FilterQuery<T>] | [FilterQuery<T>, ProjectionType<T>] = () => [
        {},
      ],
      handler: (docs: (Document<unknown, {}, T> & T)[], ctx: Context) => Promise<T> = async (
        docs,
      ) => docs as unknown as T,
      { watch = [model], ...rest }: CachedOptions = {},
    ) =>
      cached(
        async (ctx: Context): Promise<T> => {
          const [q, p] = buildQuery(ctx);
          const docs = await model.find(q, p as any);
          return handler(docs as any, ctx);
        },
        { watch, ...rest },
      ),

    /** A `model.aggregate`-backed, cached (optionally disk-cached) handler. */
    aggregate: <R = any>(
      agg: (ctx: Context, pipeline: AggregateBuilder) => AggregateBuilder = (_, p) => p,
      {
        name,
        handler = async (docs) => docs as R,
        watch = [model],
        cacheKey = (ctx) => ctx.params,
        precompute,
        ...rest
      }: AggregateOptions<R> = {},
    ) => {
      const run = async (ctx: Context): Promise<R> => {
        const docs = await model.aggregate(agg(ctx, new AggregateBuilder()).build());
        return handler(docs, ctx);
      };
      const f = name
        ? (diskCached(`aggregate-${model.modelName}-${name}`, run, {
            resolver: (ctx: Context) => JSON.stringify(cacheKey(ctx) ?? ""),
            invalidationKey: () => get("diskCache"),
            precompute: precompute
              ? async () => (await precompute()).map((ctx) => [ctx as Context])
              : undefined,
          }) as (ctx: Context) => Promise<R>)
        : run;
      return cached(f, { watch, cacheKey, ...rest });
    },

    /**
     * An Elysia micro-app exposing the standard CRUD routes for this model.
     * Mounted via `.use(model.basic(requireAuth))`, so its routes augment the
     * app type for Eden inference. `beforeHandle` (e.g. `requireAuth`) is
     * applied on this micro-app so it reliably guards every route here
     * (including those added by `extend`) regardless of Elysia hook scoping.
     */
    basic: (beforeHandle?: (ctx: Context) => unknown, extend?: (app: any) => any) => {
      const base = new Elysia();
      const app = (beforeHandle ? base.onBeforeHandle(beforeHandle) : base)
        .get("/", () => model.find().then(allToJSON))
        .get("/:id", ({ params }) => model.findById(params.id).then(toJSON))
        .post("/write", async ({ body }) => {
          const { id, data } = body as { id?: string; data: unknown };
          const result = await model.findOneAndUpdate(
            { _id: id ?? new Types.ObjectId() } as FilterQuery<T>,
            { $set: data } as any,
            { upsert: true },
          );
          return { id: result?.id?.toString?.() };
        })
        .post("/delete", async ({ body }) => {
          const { id } = body as { id?: string };
          await model.findByIdAndDelete(id);
          return { id };
        });
      return (extend ? extend(app) : app) as typeof app;
    },
  };
};
