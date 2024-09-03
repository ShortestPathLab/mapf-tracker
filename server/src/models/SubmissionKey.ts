import { Schema, model as createModel } from "mongoose";
import { createSchema } from "./createSchema";

const schema = createSchema(
  {
    request_id: { type: Schema.Types.ObjectId, ref: "request" },
    api_key: { type: String, index: true },
    creationDate: Date,
    expirationDate: Date,
    status: {
      type: {
        type: String,
        enum: ["submitted", "default"],
        default: "default",
        index: true,
      },
    },
  },
  {
    versionKey: false,
  }
);

export const model = createModel("submission_key", schema);
