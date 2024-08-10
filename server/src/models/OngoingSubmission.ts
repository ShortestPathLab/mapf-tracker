import { Mongoose } from "mongoose";

export default (mongoose: Mongoose) => {
  const schema = new mongoose.Schema(
    {
      apiKey: {
        type: String,
        required: true,
      },
      mapId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "maps",
        required: true,
      },
      scenarioId: {
        type: mongoose.Schema.Types.ObjectId,
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

  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  return mongoose.model("ongoing_submission", schema);
};
