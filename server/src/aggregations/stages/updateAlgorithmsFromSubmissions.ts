import { Algorithm } from "models";
import { PipelineStage } from "../pipeline";
import { stage as updateInstancesSubmissionHistoryFromSubmissions } from "./updateInstancesSubmissionHistoryFromSubmissions";

export const updateAlgorithmsFromSubmissions = () =>
  Algorithm.aggregate([
    {
      $lookup: {
        from: "submissions",
        localField: "_id",
        foreignField: "algo_id",
        as: "submissions",
      },
    },
    {
      $addFields: {
        best_lower: {
          $size: {
            $filter: {
              input: "$submissions",
              as: "submission",
              cond: { $eq: ["$$submission.best_lower", true] },
            },
          },
        },
        best_solution: {
          $size: {
            $filter: {
              input: "$submissions",
              as: "submission",
              cond: { $eq: ["$$submission.best_solution", true] },
            },
          },
        },
        instances_closed: {
          $size: {
            $filter: {
              input: "$submissions",
              as: "submission",
              cond: {
                $eq: ["$$submission.lower_cost", "$$submission.solution_cost"],
              },
            },
          },
        },
        instances_solved: {
          $size: {
            $filter: {
              input: "$submissions",
              as: "submission",
              cond: { $ne: ["$$submission.solution_cost", null] },
            },
          },
        },
      },
    },
    {
      $out: "algorithms",
    },
  ]);

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
