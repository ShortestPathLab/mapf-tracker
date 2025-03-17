import { OngoingSubmission, Submission } from "models";
import { Expression } from "mongoose";
import { PipelineStage } from "../pipeline";

/**
 * Aggregation pipeline that removes all ongoing submissions that have a status that is not "submitted".
 * The result is written back to the "ongoing_submissions" collection.
 *
 * The pipeline is as follows:
 * 1. Find all submission keys with status "submitted".
 * 2. Filter all ongoing submissions to only include those with a status that is not "submitted".
 * 3. Write the result back to the "ongoing_submissions" collection.
 */
export const pruneOngoingSubmissions = () =>
  OngoingSubmission.aggregate(
    [
      {
        $lookup: {
          from: "submission_keys",
          localField: "apiKey",
          foreignField: "api_key",
          as: "status",
        },
      },
      { $addFields: { status: "$status.type" } },
      { $match: { $expr: { $eq: ["$status", "submitted"] } } },
      { $out: "ongoing_submissions" },
    ],
    { allowDiskUse: true }
  );

export const stage: PipelineStage = {
  key: "pruneOngoingSubmissions",
  run: async () => ({
    result: await pruneOngoingSubmissions(),
  }),
  dependents: [],
  destructive: true,
  description: `
**Warning:** This is a destructive action. Before running this pipeline, ensure that you have merged ongoing_submissions into submissions.

Aggregation pipeline that removes all ongoing submissions that have a status that is "submitted".
  
The pipeline is as follows:
1. Find all submission keys with status "submitted".
2. Filter all ongoing submissions to only include those with a status that is "submitted".
3. Write the result back to the "ongoing_submissions" collection.`,
};
