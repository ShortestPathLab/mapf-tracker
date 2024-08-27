import { Schema, model as createModel } from "mongoose";
import { createSchema } from "./createSchema";
import { Types } from "mongoose";

const schema = createSchema(
  {
    algo_name: String,
    authors: String,
    papers: String,
    github: String,
    comments: String,
    user_id: { type: Schema.Types.ObjectId, ref: "user" },
    best_lower: Number,
    best_solution: Number,
    instances_closed: Number,
    instances_solved: Number,
    requestId: { type: Types.ObjectId, ref: "users" },
  },
  {
    versionKey: false,
  }
);

export const model = createModel("algorithm", schema);
