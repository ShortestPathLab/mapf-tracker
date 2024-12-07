import { Schema, model as createModel } from "mongoose";
import { createSchema } from "./createSchema";

const schema = createSchema({
  requesterName: String,
  requesterEmail: String,
  requesterAffiliation: String,
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
        enum: ["not-reviewed", "approved", "rejected"],
        default: "not-reviewed",
      },
      comments: {
        type: String,
        default: "",
      },
    },
    default: {
      status: "not-reviewed",
      comments: "",
    },
    _id: false,
  },
});

export const model = createModel("request", schema);
