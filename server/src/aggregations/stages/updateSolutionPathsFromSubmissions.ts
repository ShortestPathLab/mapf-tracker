import { OngoingSubmissionSolution, SolutionPath, Submission } from "models";
import { PipelineStage } from "../pipeline";

export const updateSolutionPathsFromSubmissions = () => {
  return Submission.aggregate([
    {
      $match: {
        best_solution: true, // Only consider submissions with best_solution flag
      },
    },
    //TODO: Add a filter for only running this for specified subset of submissions
    {
      $lookup: {
        from: OngoingSubmissionSolution.collection.collectionName,
        localField: "ongoing_submission_id",
        foreignField: "_id",
        as: "ongoing_submission_solution",
      },
    },
    {
      $addFields: {
        solution_path: {
          $first: "$ongoing_submission_solution.solutions",
        },
      },
    },
    {
      $addFields: {
        solution_path: {
          $function: {
            args: ["$solution_path"],
            lang: "js",

            body: function (v) {
              return v
                ? v.replace("u", "_").replace("d", "u").replace("_", "d")
                : v;
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        instance_id: 1,
        solution_path: 1,
      },
    },
    {
      $merge: {
        into: SolutionPath.collection.collectionName,
        on: "_id",
        whenMatched: "merge",
        whenNotMatched: "insert",
      },
    },
  ]);
};

export const stage: PipelineStage = {
  key: "updateSolutionPathsFromSubmissions",
  run: async () => ({ result: await updateSolutionPathsFromSubmissions() }),
  dependents: [],
  description: () => `
This pipeline aggregates all submissions for each instance and updates the
instance model with the following information:
- solution_path: The solution path that the submission has the best solution.

The result is written back to the SolutionPath collection.
`,
};
