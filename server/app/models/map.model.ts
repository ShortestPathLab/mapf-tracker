import { Mongoose } from "mongoose";

export default (mongoose: Mongoose) => {
  const schema = new mongoose.Schema({
    map_name: String,
    map_size: String,
    map_type: String,
    scens: Number,
    instances: Number,
    instances_closed: Number,
    instances_solved: Number,
  });

  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Map = mongoose.model("map", schema);
  return Map;
};
