import { Mongoose } from "mongoose";

export default (mongoose: Mongoose) => {
  const schema = new mongoose.Schema(
    {
      algo_name: String,
      authors: String,
      papers: String,
      github: String,
      comments: String,
      user_id: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
      best_lower: Number,
      best_solution: Number,
      instances_closed: Number,
      instances_solved: Number,
    },
    {
      versionKey: false,
    }
  );

  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  return mongoose.model("algorithm", schema);
};
