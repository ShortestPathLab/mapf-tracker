import { RequestHandler, Response as Res } from "express";
import { Document, FilterQuery, Model } from "mongoose";
import z from "zod";

export const toJson = (r: Response) => r.json();
export const toBlob = (r: Response) => r.blob();
export const toText = (r: Response) => r.text();

export const json = <T>(p: string) => fetch(p).then(toJson) as Promise<T>;
export const text = (p: string) => fetch(p).then(toText);
export const blob = (p: string) => fetch(p).then(toBlob);

export const queryClient =
  <T>(model: Model<T>) =>
  <V extends z.ZodType>(
    validate: V = z.any() as any,
    query: (b: z.infer<V>) => FilterQuery<T> = () => ({}),
    handler: (q: Document<T>[]) => Promise<any> = async (q) => q
  ): RequestHandler<z.infer<V>> =>
  async (req, res) => {
    const { success, data, error } = await validate.safeParseAsync(req.params);
    if (!success) return res.status(400).json(error.format());
    try {
      const q = query(data);
      const docs = await model.find(q);
      res.json(await handler(docs as any));
    } catch (e) {
      res.status(500).json({
        error: `Error occurred in ${model.modelName} query handler: ${e}`,
      });
    }
  };
