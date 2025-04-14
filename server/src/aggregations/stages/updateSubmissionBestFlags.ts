import { map } from "lodash";
import { Instance, Submission } from "models";
import { PipelineStage } from "../pipeline";

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
            best_solution: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$solution_cost", null] },
                    {
                      $eq: [
                        "$solution_cost",
                        { $first: "$instance.solution_cost" },
                      ],
                    },
                  ],
                },
                true,
                false,
              ],
            },
            best_lower: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$lower_cost", null] },
                    {
                      $eq: ["$lower_cost", { $first: "$instance.lower_cost" }],
                    },
                  ],
                },
                true,
                false,
              ],
            },
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
  dependents: [],
  description: () => ``,
};
