import { model as createModel } from "mongoose";
import { createSchema } from "./createSchema";

const schema = createSchema({
  map_name: { type: String, index: true },
  map_size: String,
  map_type: String,
  scens: Number,
  instances: Number,
  instances_closed: Number,
  instances_solved: Number,
  proportion_instances_closed: Number,
  proportion_instances_solved: Number,
});

export const model = createModel("map", schema);
