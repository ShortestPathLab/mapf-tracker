import { InferSchemaType, Mongoose, Schema } from "mongoose";

const schema = new Schema({
  map_name: String,
  map_size: String,
  map_type: String,
  scens: Number,
  instances: Number,
  instances_closed: Number,
  instances_solved: Number,
});

export type Map = InferSchemaType<typeof schema>;

export default (mongoose: Mongoose) => {
  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Map = mongoose.model("map", schema);
  return Map;
};
