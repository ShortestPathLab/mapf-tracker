import { Request, RequestHandler } from "express";
import { AggregateBuilder } from "mongodb-aggregate-builder";
import { Document, FilterQuery, Model, ProjectionType } from "mongoose";
import z from "zod";
import memo from "p-memoize";
import hash from "object-hash";
import QuickLRU from "quick-lru";

export const toJson = (r: Response) => r.json();
export const toBlob = (r: Response) => r.blob();
export const toText = (r: Response) => r.text();

export const json = <T>(p: string) => fetch(p).then(toJson) as Promise<T>;
export const text = (p: string) => fetch(p).then(toText);
export const blob = (p: string) => fetch(p).then(toBlob);

export function cached<T, V extends z.ZodType, U>(
  watch: Model<any>[],
  validate: V = z.any() as any,
  handler: (req: z.infer<V>) => Promise<any>,
  source: "body" | "params" = "params"
) {
  const cache = new QuickLRU<string, Awaited<U>>({ maxSize: 1000 });
  const g = memo(handler, { cache, cacheKey: ([a]) => hash(a) });
  for (const w of watch) {
    w.watch().on("change", () => cache.clear());
  }
  return (async (req, res) => {
    const request = await validate.parseAsync(req[source]);
    const out = await g(request);
    return res.json(out);
  }) as RequestHandler<unknown>;
}

export const queryClient = <T>(model: Model<T>) => {
  const createHandler = <V extends z.ZodType, U>(
    validate: V = z.any() as any,
    f: (data: z.infer<V>) => Promise<U>
  ): RequestHandler<z.infer<V>> => {
    const cache = new QuickLRU<string, Awaited<U>>({ maxSize: 1000 });
    const g = memo(f, { cache, cacheKey: ([a]) => hash(a) });
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
      }
    };
  };

  return {
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
      validate: V = z.any() as any,
      agg: (b: z.infer<V>, pipeline: AggregateBuilder) => AggregateBuilder = (
        _,
        p
      ) => p,
      handler: (q: any) => Promise<any> = async (q) => q
    ): RequestHandler<z.infer<V>> =>
      createHandler(validate, async (data) => {
        const q = agg(data, new AggregateBuilder());
        const docs = await model.aggregate(q.build());
        return await handler(docs);
      }),
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
      console.log(e);
      res.status(500).json({
        error: e,
      });
    }
  };
};
