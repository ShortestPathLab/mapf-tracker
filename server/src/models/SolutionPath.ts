import { Schema, model as createModel } from "mongoose";

const schema = new Schema({
  instance_id: { type: Schema.Types.ObjectId, ref: "instance" },
  solution_path: String,
});

export const model = createModel("solution_path", schema);
