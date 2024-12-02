import { Schema, model as createModel } from "mongoose";
import { createSchema } from "./createSchema";

const schema = createSchema(
  {
    apiKey: {
      type: String,
      required: true,
      index: true,
    },
    instance: {
      type: Schema.Types.ObjectId,
      ref: "instances",
      required: true,
    },
    lowerBound: Number,
    cost: Number,
    solutions: [String],
    options: { skipValidation: Schema.Types.Boolean },
    validation: {
      isValidationRun: Schema.Types.Boolean,
      errors: [String],
      outcome: String,
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

schema.index({ apiKey: 1, instance: 1, createdAt: 1 });

export const model = createModel("ongoing_submission", schema);
