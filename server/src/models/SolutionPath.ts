import { Schema, model as createModel } from "mongoose";
import { createSchema } from "./createSchema";

const schema = createSchema({
  instance_id: { type: Schema.Types.ObjectId, ref: "instance" },
  solution_path: String,
});

export const model = createModel("solution_path", schema);
