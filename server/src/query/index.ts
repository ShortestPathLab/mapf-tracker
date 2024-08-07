import { RequestHandler } from "express";
import { FilterQuery, Model } from "mongoose";
import z from "zod";

export const queryClient =
  <T>(model: Model<T>) =>
  <V extends z.ZodType>(
    validate: V = z.any() as any,
    query: (b: z.infer<V>) => FilterQuery<T> = () => ({})
  ): RequestHandler<z.infer<V>> =>
  async (req, res) => {
    const { success, data, error } = await validate.safeParseAsync(req.params);
    if (!success) return res.status(400).json(error.format());
    try {
      const q = query(data);
      res.json(await model.find(q));
    } catch (e) {
      res.status(500).json({
        error: `Error occurred in ${model.modelName} query handler: ${e}`,
      });
    }
  };
