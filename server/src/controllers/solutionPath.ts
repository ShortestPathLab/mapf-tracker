import { RequestHandler } from "express";
import { OngoingSubmission, SolutionPath, Submission } from "models";
import { z } from "zod";

export const findPath: RequestHandler = async (req, res) => {
  const { id, source } = z
    .object({
      id: z.string(),
      source: z.enum(["ongoing", "submitted"]).default("submitted"),
    })
    .parse(req.params);
  const data =
    source === "submitted"
      ? await Submission.findOne({ _id: id })
      : await OngoingSubmission.findOne({ _id: id });
  return res.send(data?.solutions);
};
