import { Status } from "aggregations";
import { model as createModel, Schema } from "mongoose";
import { createSchema } from "./createSchema";

const schema = createSchema({
  _id: String,
  version: Number,
});

export const model = createModel("version", schema);

export const get = async (version: string) =>
  (await model.findOne({ version }))?.toObject?.()?.version ?? 0;

export const set = async (key: string, version: number) => {
  await model.updateOne({ _id: key }, { version }, { upsert: true });
};
