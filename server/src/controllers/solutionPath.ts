import { RequestHandler } from "express";
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
  return data?.solutions;
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
