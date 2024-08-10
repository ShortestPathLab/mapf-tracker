import { Schema, model as createModel } from "mongoose";
import { createSchema } from "./createSchema";

const schema = createSchema(
  {
    request_id: { type: Schema.Types.ObjectId, ref: "request" },
    api_key: String,
    creationDate: Date,
    expirationDate: Date,
  },
  {
    versionKey: false,
  }
);

export const model = createModel("submission_key", schema);
