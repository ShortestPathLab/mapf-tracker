import { Mongoose } from "mongoose";

export default (mongoose: Mongoose) => {
  const schema = new mongoose.Schema({
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
    validated: Boolean,
    error: { isError: Boolean, errorMessage: String },
  });

  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  return mongoose.model("ongoing_submission", schema);
};
