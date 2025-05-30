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
      index: true,
    },
    lowerBound: Number,
    cost: Number,
    solutions: {
      type: Schema.Types.ObjectId,
      ref: "ongoing_submission_solution",
    },
    options: { skipValidation: Schema.Types.Boolean },
    validation: {
      timeTaken: Number,
      isValidationRun: Schema.Types.Boolean,
      errors: [
        {
          label: String,
          agents: { type: [Number], required: false },
          timesteps: { type: [Number], required: false },
        },
      ],
      outcome: String,
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

schema.index({ apiKey: 1, instance: 1, createdAt: 1 });
schema.index({ createdAt: 1 });

export const model = createModel("ongoing_submission", schema);
