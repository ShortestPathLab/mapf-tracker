import {
  InferSchemaType,
  Mongoose,
  Schema,
  model as createModel,
} from "mongoose";
import { createSchema } from "./createSchema";

const schema = createSchema({
  map_id: { type: Schema.Types.ObjectId, ref: "map" },
  scen_type: String,
  type_id: Number,
  instances: Number,
  instances_closed: Number,
  instances_solved: Number,
});

export const model = createModel("scenario", schema);
