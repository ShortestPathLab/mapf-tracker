import { Schema, model as createModel } from "mongoose";
import { createSchema } from "./createSchema";
import { Types } from "mongoose";
import { queryClient } from "query";
import { algorithmCommon } from "./Algorithm.common";

const schema = createSchema(
  {
    algo_name: String,
    authors: String,
    papers: String,
    github: String,
    dblp: String,
    google_scholar: String,
    comments: String,
    user_id: { type: Schema.Types.ObjectId, ref: "user" },
    best_lower: Number,
    best_solution: Number,
    instances_closed: Number,
    instances_solved: Number,
    // Written by the updateAlgorithmsFromSubmissions pipeline stage (total
    // instance count + the request join), so declare them here so the wire
    // type matches the stored documents.
    instances: Number,
    requesterName: String,
    request_id: { type: Schema.Types.ObjectId, ref: "request" },
    submittedAt: Date,
    ...algorithmCommon,
    requestId: { type: Types.ObjectId, ref: "users" },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    versionKey: false,
  },
);

export const model = createModel("algorithm", schema);

export const query = queryClient(model);
