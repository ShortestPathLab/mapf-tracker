import { Schema, model as createModel } from "mongoose";
import { createSchema } from "./createSchema";

const schema = createSchema(
  {
    apiKey: {
      type: String,
      required: true,
    },
    mapId: {
      type: Schema.Types.ObjectId,
      ref: "maps",
      required: true,
    },
    scenarioId: {
      type: Schema.Types.ObjectId,
      ref: "scenarios",
      required: true,
    },
    index: Number,
    lowerCost: Number,
    solutionCost: Number,
    solutionPath: String,
    validation: {
      isValidationRun: Boolean,
      errors: [String],
      outcome: String,
    },
    agentCountIntent: Number,
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

schema.index({
  apiKey: "text",
  mapId: "text",
  scenarioId: "text",
  agentCountIntent: 1,
});

export const model = createModel("ongoing_submission", schema);
