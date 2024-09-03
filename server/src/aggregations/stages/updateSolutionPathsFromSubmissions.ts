import { SolutionPath } from "models";
import { PipelineStage } from "../pipeline";

/**
 * This aggregation pipeline creates a new collection "solution_path" with the best solution path for each instance.
 * The pipeline is as follows:
 * 1. Look up all submissions for each instance and add them to the submissions array.
 * 2. Unwind the submissions array so that each submission becomes a separate document.
 * 3. Filter the results to only include submissions where best_solution is true.
 * 4. Project the results to only include the solution_path field from the submission.
 * 5. Write the results to a new collection called "solution_path".
 */
export const updateSolutionPathsFromSubmissions = () => {
  throw new Error("Not implemented");
  return SolutionPath.aggregate([
    //TODO: Add a filter for only running this for specified subset of submissions
    {
      $lookup: {
        from: "submissions",
        localField: "instance_id",
        foreignField: "instance_id",
        as: "submissions",
      },
    },
    {
      $unwind: {
        path: "$submissions",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        "submissions.best_solution": true,
      },
    },
    {
      $project: {
        _id: 0,
        //FIXME: Currently submission doesn't have solution path
        solution_path: "$submissions.solution_path",
      },
    },
    {
      $out: "solution_path",
    },
  ]);
};

export const stage: PipelineStage = {
  key: "updateSolutionPathsFromSubmissions",
  run: async () => ({ result: await updateSolutionPathsFromSubmissions() }),
  dependents: [],
  description: `
This pipeline aggregates all submissions for each instance and updates the
instance model with the following information:
- solution_path: The solution path that the submission has the best solution.

The result is written back to the SolutionPath collection.
`,
};
