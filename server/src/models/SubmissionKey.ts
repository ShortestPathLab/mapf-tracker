import { Mongoose } from "mongoose";

export default (mongoose: Mongoose) => {
  const schema = new mongoose.Schema(
    {
      request_id: { type: mongoose.Schema.Types.ObjectId, ref: "request" },
      api_key: String,
      creationDate: Date,
      expirationDate: Date,
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

  const Submission_key = mongoose.model("submission_key", schema);
  return Submission_key;
};
