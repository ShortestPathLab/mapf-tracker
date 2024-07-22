import { Mongoose } from "mongoose";

export default (mongoose: Mongoose) => {
  const schema = new mongoose.Schema({
    instance_id: { type: mongoose.Schema.Types.ObjectId, ref: "instance" },
    solution_path: String,
  });

  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Solution_path = mongoose.model("solution_path", schema);
  return Solution_path;
};
