import { map } from "lodash";
import { Instance, Submission } from "models";
import { PipelineStage } from "../pipeline";
import { stage as updateSolutionPathsFromSubmissions } from "./updateSolutionPathsFromSubmissions";
import { stage as invalidateQueryCache } from "./invalidateQueryCache";

const $if = (condition: any) => ({
  $cond: [condition, true, false],
});

export const updateSubmissionBestFlags = async () =>
  await Promise.all(
    map(await Submission.distinct("algo_id"), (document) =>
      Submission.aggregate([
        { $match: { algo_id: document._id } },
        {
          $lookup: {
            from: Instance.collection.collectionName,
            localField: "instance_id",
            foreignField: "_id",
            as: "instance",
          },
        },
        {
          $addFields: {
            best_solution: $if({
              $and: [
                { $ne: ["$solution_cost", null] },
                {
                  $eq: [
                    "$solution_cost",
                    { $first: "$instance.solution_cost" },
                  ],
                },
              ],
            }),
            best_lower: $if({
              $and: [
                { $ne: ["$lower_cost", null] },
                {
                  $eq: ["$lower_cost", { $first: "$instance.lower_cost" }],
                },
              ],
            }),
          },
        },
        { $project: { instance: 0 } },
        {
          $merge: {
            into: Submission.collection.collectionName,
          },
        },
      ])
    )
  );

export const stage: PipelineStage = {
  key: "updateSubmissionBestFlags",
  run: async () => ({
    result: await updateSubmissionBestFlags(),
  }),
  dependents: [updateSolutionPathsFromSubmissions, invalidateQueryCache],
  description: () => ``,
};
