import { stages, Status } from "aggregations";
import { Schema, model as createModel } from "mongoose";
import { createSchema } from "./createSchema";

const schema = createSchema<Partial<Status>>({
  type: {
    type: String,
    enum: ["invalidated", "done", "running", "error", "pending"],
  },
  stage: { type: String, index: true },
  variables: { type: Schema.Types.Mixed },
  timestamp: { type: Number },
  error: { type: Schema.Types.Mixed },
});

export const model = createModel("pipeline_status", schema);

export const get = async (stage: string) =>
  (await model.findOne({ stage }))?.toObject?.() ?? {
    status: "invalidated",
    stage,
    variables: {},
    timeStamp: undefined,
  };

export const set = async (stage: string, status: Partial<Status>) => {
  await model.updateOne({ stage }, status, { upsert: true });
};
