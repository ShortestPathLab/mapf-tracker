import { Status } from "aggregations";
import { model as createModel, Schema } from "mongoose";
import { createSchema } from "./createSchema";
import memoize from "p-memoize";
import ExpiryMap from "expiry-map";

const schema = createSchema({
  _id: String,
  version: Number,
});

export const model = createModel("version", schema);

export const get = memoize(
  async (key: string) => (await model.findOne({ _id: key }))?.version ?? 0,
  { cache: new ExpiryMap(1000 * 60) },
);

export const set = async (key: string, version: number) => {
  await model.updateOne({ _id: key }, { version }, { upsert: true });
};
