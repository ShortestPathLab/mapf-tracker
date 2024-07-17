module.exports = (mongoose) => {
  var schema = mongoose.Schema({
    api_key: { type: String, required: true, ref: "submission_key" },
    map_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "map",
      required: true,
    },
    scen_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "scenario",
      required: true,
    },
    agents: Number,
    lower_cost: Number,
    solution_cost: Number,
    solution_path: String,
    error: { isError: Boolean, errorMessage: String },
  });

  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const OngoingSubmission = mongoose.model("onging_submission", schema);
  return OngoingSubmission;
};
