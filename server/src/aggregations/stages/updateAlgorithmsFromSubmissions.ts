import { Algorithm, Instance, Submission } from "models";
import { PipelineStage } from "../pipeline";
import { stage as updateInstancesSubmissionHistoryFromSubmissions } from "./updateInstancesSubmissionHistory";
import submission from "routes/submission";
import { map } from "lodash";

export const updateAlgorithmsFromSubmissions = async () =>
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
          $facet: {
            best_lower: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $ne: ["$lower_cost", null] },
                      {
                        $eq: [
                          "$lower_cost",
                          { $first: "$instance.lower_cost" },
                        ],
                      },
                    ],
                  },
                },
              },
              { $count: "count" },
            ],
            best_solution: [
              {
                $match: {
                  $expr: {
                    $eq: [
                      "$solution_cost",
                      { $first: "$instance.solution_cost" },
                    ],
                  },
                },
              },
              { $count: "count" },
            ],
            instances_closed: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $ne: ["$lower_cost", null] },
                      { $ne: ["$solution_cost", null] },
                      { $ne: [{ $first: "$instance.lower_cost" }, null] },
                      {
                        $eq: [
                          "$solution_cost",
                          { $first: "$instance.lower_cost" },
                        ],
                      },
                    ],
                  },
                },
              },
              { $count: "count" },
            ],
            instances_solved: [
              { $match: { solution_cost: { $ne: null } } },
              { $count: "count" },
            ],
            instances: [{ $count: "count" }],
          },
        },
        {
          $addFields: {
            _id: { $toObjectId: document._id },
            best_lower: { $first: "$best_lower.count" },
            best_solution: { $first: "$best_solution.count" },
            instances_closed: { $first: "$instances_closed.count" },
            instances_solved: { $first: "$instances_solved.count" },
            instances: { $first: "$instances.count" },
          },
        },
        {
          $project: {
            _id: 1,
            best_lower: { $ifNull: ["$best_lower", 0] },
            best_solution: { $ifNull: ["$best_solution", 0] },
            instances_closed: { $ifNull: ["$instances_closed", 0] },
            instances_solved: { $ifNull: ["$instances_solved", 0] },
            instances: { $ifNull: ["$instances", 0] },
          },
        },
        {
          $lookup: {
            from: "submission_keys",
            // algo_id has the same id as the submission_key_id
            localField: "_id",
            foreignField: "_id",
            as: "request_id",
          },
        },
        { $addFields: { request_id: { $first: "$request_id.request_id" } } },
        {
          $lookup: {
            from: "requests",
            localField: "request_id",
            foreignField: "_id",
            as: "request",
          },
        },
        { $addFields: { request: { $first: "$request" } } },
        {
          $addFields: {
            algo_name: "$request.algorithmName",
            authors: "$request.authorName",
            papers: "$request.paperReference",
            github: "$request.githubLink",
          },
        },
        { $project: { request: 0, requestId: 0 } },
        {
          $merge: {
            into: "algorithms",
            whenMatched: "merge",
            whenNotMatched: "insert",
          },
        },
      ])
    )
  );

export const stage: PipelineStage = {
  key: "updateAlgorithmsFromSubmissions",
  run: async () => ({
    result: await updateAlgorithmsFromSubmissions(),
  }),
  dependents: [updateInstancesSubmissionHistoryFromSubmissions],
  description: `
This pipeline aggregates all submissions for each algorithm and updates the
algorithm model with the following information:
- best_lower: The number of instances where the submission has the best lower
  bound.
- best_solution: The number of instances where the submission has the best
  solution.
- instances_closed: The number of instances where the submission has the best
  lower bound and the best solution cost.
- instances_solved: The number of instances where the submission has a valid
  solution cost.
  `,
};
