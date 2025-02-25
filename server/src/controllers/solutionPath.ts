import { RequestHandler } from "express";
import { split } from "lodash";
import { OngoingSubmission, SolutionPath, Submission } from "models";
import { z } from "zod";

export const getSolutionPath = async (
  id: string,
  source: "ongoing" | "submitted"
) => {
  const data =
    source === "submitted"
      ? await Submission.findOne({ _id: id })
      : await OngoingSubmission.findOne({ _id: id });
  if (data?.solutions) {
    return data.solutions;
  } else {
    // Legacy solution path storage handling
    const path = (await SolutionPath.findOne({ _id: id }))?.solution_path;
    if (path) {
      return split(
        path.replaceAll("u", "_").replaceAll("d", "u").replaceAll("_", "d"),
        "\n"
      );
    }
  }
};

export const findPath: RequestHandler = async (req, res) => {
  const { id, source } = z
    .object({
      id: z.string(),
      source: z.enum(["ongoing", "submitted"]).default("submitted"),
    })
    .parse(req.params);
  return res.send(await getSolutionPath(id, source));
};
