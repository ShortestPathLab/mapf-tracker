import { InferSchemaType, Mongoose, Schema } from "mongoose";

const schema = new Schema({
  map_id: { type: Schema.Types.ObjectId, ref: "map" },
  scen_type: String,
  type_id: Number,
  instances: Number,
  instances_closed: Number,
  instances_solved: Number,
});

export type Scenario = InferSchemaType<typeof schema>;

export default (mongoose: Mongoose) => {
  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  return mongoose.model("scenario", schema);
};
