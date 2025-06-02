import { Request, RequestHandler, Router } from "express";
import { AggregateBuilder } from "mongodb-aggregate-builder";
import { Document, FilterQuery, Model, ProjectionType, Types } from "mongoose";
import z from "zod";
import memo, { AnyAsyncFunction } from "p-memoize";
import hash from "object-hash";
import QuickLRU from "quick-lru";
import { log } from "logging";
import { has } from "lodash";
import { diskCached } from "./withDiskCache";

export const toJson = (r: Response) => r.json();
export const toBlob = (r: Response) => r.blob();
export const toText = (r: Response) => r.text();

export const json = <T>(p: string) => fetch(p).then(toJson) as Promise<T>;
export const text = (p: string) => fetch(p).then(toText);
export const blob = (p: string) => fetch(p).then(toBlob);

const createCache = <T extends AnyAsyncFunction>(f: T) => {
  const cache = new QuickLRU<string, Awaited<ReturnType<T>>>({ maxSize: 1000 });
  const g = memo(f, {
    cache,
    cacheKey: ([a]) => hash(a ?? ""),
  });
  return [g, cache] as const;
};

export function cached<V extends z.ZodType>(
  watch: Model<any>[],
  validate: V = z.any() as any,
  handler: (req: z.infer<V>) => Promise<any>,
  source: "body" | "params" = "params"
) {
  const [g, cache] = createCache(handler);
  for (const w of watch) {
    w.watch().on("change", () => cache.clear());
  }
  return (async (req, res) => {
    try {
      const request = await validate.parseAsync(req[source]);
      const out = await g(request);
      return res.json(out);
    } catch (e) {
      res.status(500).json({
        error: `Error occurred: ${e}`,
      });
    }
  }) as RequestHandler<unknown>;
}

export const queryClient = <T>(model: Model<T>) => {
  const createHandler = <V extends z.ZodType, U>(
    validate: V = z.any() as any,
    f: (data: z.infer<V>) => Promise<U>
  ): RequestHandler<z.infer<V>> => {
    const [g, cache] = createCache(f);
    model.watch().on("change", () => cache.clear());
    return async (req, res) => {
      const { success, data, error } = await validate.safeParseAsync({
        ...req.params,
        ...req.query,
      });
      if (!success) return res.status(400).json(error.format());
      try {
        res.json(await g(data));
      } catch (e) {
        res.status(500).json({
          error: `Error occurred in ${model.modelName} query handler: ${e}`,
        });
        console.log(e);
      }
    };
  };

  return {
    basic: (router = Router()) =>
      router
        .get(
          "/",
          createHandler(z.unknown(), async () => model.find())
        )
        .get(
          "/:id",
          createHandler(
            z.object({
              id: z.string(),
            }),
            async ({ id }) => model.findById(id)
          )
        )
        .post(
          "/write",
          route(
            z.object({
              id: z.string().optional(),
              data: z.any(),
            }),
            async ({ id, data }) => {
              const result = await model.findOneAndUpdate(
                { _id: id ?? new Types.ObjectId() },
                { $set: data },
                {
                  upsert: true,
                }
              );
              return { id: result?.id?.toString?.() };
            },
            { source: "body" }
          )
        )
        .post(
          "/delete",
          route(
            z.object({ id: z.string().optional() }),
            async ({ id }) => {
              await model.findByIdAndDelete(id);
              return { id };
            },
            { source: "body" }
          )
        ),
    query: <V extends z.ZodType>(
      validate: V = z.any() as any,
      query: (
        b: z.infer<V>
      ) => [FilterQuery<T>] | [FilterQuery<T>, ProjectionType<T>] = () => [{}],
      handler: (q: (Document<T> & T)[]) => Promise<any> = async (q) => q
    ): RequestHandler<z.infer<V>> =>
      createHandler(validate, async (data) => {
        const [q, p] = query(data);
        const docs = await model.find(q, p);
        return await handler(docs as any);
      }),
    aggregate: <V extends z.ZodType>(
      name: string | undefined,
      validate: V = z.any() as any,
      agg: (b: z.infer<V>, pipeline: AggregateBuilder) => AggregateBuilder = (
        _,
        p
      ) => p,
      handler: (q: any) => Promise<any> = async (q) => q
    ): RequestHandler<z.infer<V>> => {
      const f = async (data: z.infer<V>) => {
        const q = agg(data, new AggregateBuilder());
        const docs = await model.aggregate(q.build());
        return await handler(docs);
      };
      return createHandler(
        validate,
        name ? diskCached(`aggregate-${model.modelName}-${name}`, f) : f
      );
    },
  };
};

export const route = <T extends z.ZodType, R>(
  validate: T = z.any() as any,
  f: (data: z.infer<T>, req: Request) => Promise<R | undefined> = async () =>
    undefined,
  { source = "body" }: { source?: "body" | "params" } = {}
): RequestHandler<z.infer<T>, {}, R> => {
  return async (req, res) => {
    const { success, data, error } = await validate.safeParseAsync(req[source]);
    if (!success) return res.status(400).json(error.format());
    try {
      const out = await f(data, req);
      res.json(out ?? undefined);
    } catch (e) {
      log.error("Query error", { message: has(e, "message") ? e.message : e });
      console.error(e);
      res.status(500).json({
        error: e,
      });
    }
  };
};
