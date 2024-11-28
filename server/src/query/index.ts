import { Request, RequestHandler, Response as Res } from "express";
import { Document, FilterQuery, Model, PipelineStage } from "mongoose";
import z from "zod";

export const toJson = (r: Response) => r.json();
export const toBlob = (r: Response) => r.blob();
export const toText = (r: Response) => r.text();

export const json = <T>(p: string) => fetch(p).then(toJson) as Promise<T>;
export const text = (p: string) => fetch(p).then(toText);
export const blob = (p: string) => fetch(p).then(toBlob);

export const queryClient = <T>(model: Model<T>) => {
  const createHandler =
    <V extends z.ZodType, U>(
      validate: V = z.any() as any,
      f: (data: z.infer<V>) => Promise<U>
    ): RequestHandler<z.infer<V>> =>
    async (req, res) => {
      const { success, data, error } = await validate.safeParseAsync(
        req.params
      );
      if (!success) return res.status(400).json(error.format());
      try {
        res.json(await f(data));
      } catch (e) {
        res.status(500).json({
          error: `Error occurred in ${model.modelName} query handler: ${e}`,
        });
      }
    };

  return {
    query: <V extends z.ZodType>(
      validate: V = z.any() as any,
      query: (b: z.infer<V>) => FilterQuery<T> = () => ({}),
      handler: (q: (Document<T> & T)[]) => Promise<any> = async (q) => q
    ): RequestHandler<z.infer<V>> =>
      createHandler(validate, async (data) => {
        const q = query(data);
        const docs = await model.find(q);
        return await handler(docs as any);
      }),
    aggregate: <V extends z.ZodType>(
      validate: V = z.any() as any,
      agg: (b: z.infer<V>) => PipelineStage[] = () => [],
      handler: (q: any) => Promise<any> = async (q) => q
    ): RequestHandler<z.infer<V>> =>
      createHandler(validate, async (data) => {
        const q = agg(data);
        const docs = await model.aggregate(q);
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
      res.json(out);
    } catch (e) {
      res.status(500).json({
        error: e,
      });
    }
  };
};
