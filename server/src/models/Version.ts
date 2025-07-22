import { Status } from "aggregations";
import { model as createModel, Schema } from "mongoose";
import { createSchema } from "./createSchema";
import memoizee from "memoizee";

const schema = createSchema({
  _id: String,
  version: Number,
});

export const model = createModel("version", schema);

export const get = memoizee(
  async (key: string) => (await model.findOne({ _id: key }))?.version ?? 0,
  {
    maxAge: 1000 * 60, // Clear cache every minute
    promise: true,
  }
);

export const set = async (key: string, version: number) => {
  await model.updateOne({ _id: key }, { version }, { upsert: true });
};
