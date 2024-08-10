import { Schema, model as createModel } from "mongoose";

const schema = new Schema(
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
