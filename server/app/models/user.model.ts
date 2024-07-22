import { Mongoose } from "mongoose";

export default (mongoose: Mongoose) => {
  const schema = new mongoose.Schema({
    username: String,
    password: String,
  });

  schema.method("toJSON", () => {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const User = mongoose.model("User", schema);
  return User;
};
