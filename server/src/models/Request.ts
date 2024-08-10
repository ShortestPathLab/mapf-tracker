import { Schema, model as createModel } from "mongoose";
import { createSchema } from "./createSchema";

const schema = createSchema({
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

export const model = createModel("request", schema);
