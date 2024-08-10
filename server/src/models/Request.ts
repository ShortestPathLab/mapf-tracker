import { Mongoose } from "mongoose";

export default (mongoose: Mongoose) => {
  const schema = new mongoose.Schema({
    requesterName: String,
    requesterEmail: String,
    requesterAffilation: String,
    googleScholar: String,
    dblp: String,
    justification: String,
    algorithmName: String,
    authorName: String,
    paperReference: String,
    githubLink: String,
    comments: String,
    isApproved: Boolean,
    reviewStatus: {
      type: {
        status: {
          type: String,
          enum: ["Not Reviewed", "Approved", "Rejected"],
          default: "Not Reviewed",
        },
        comments: {
          type: String,
          default: "",
        },
      },
      default: {
        status: "Not Reviewed",
        comments: "",
      },
      _id: false,
    },
  });

  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Request = mongoose.model("request", schema);
  return Request;
};
