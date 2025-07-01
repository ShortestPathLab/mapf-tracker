import { RequestHandler } from "express";
import { chunk, map, split, zipWith } from "lodash";
import { OngoingSubmissionSolution, SolutionPath, Submission } from "models";
import { Types } from "mongoose";
import { encode } from "validator";
import { z } from "zod";

export const getSolutionPath = async (
  id: string,
  source: "ongoing" | "submitted"
) => {
  const data =
    source === "submitted"
      ? await Submission.findOne({ _id: id })
      : await OngoingSubmissionSolution.findOne({ _id: id });
  if (data?.solutions) {
    return split(data.solutions, "\n");
  } else {
    // Legacy solution path storage handling
    const path =
      (await SolutionPath.findOne({ _id: id }))?.solution_path ??
      (await SolutionPath.findOne({ instance_id: id }))?.solution_path;
    if (path) {
      return split(
        path.replaceAll("u", "_").replaceAll("d", "u").replaceAll("_", "d"),
        "\n"
      );
    }
  }
};

export async function getSolutionPathsRaw(ids: string[]) {
  const chunks = chunk(ids, 250);
  const all: string[] = [];
  for (const c of chunks) {
    const q = {
      _id: {
        $in: map(c, (id) => new Types.ObjectId(id)),
      },
    };
    all.push(
      ...(await SolutionPath.find(q, { solution_path: 1 })).map((b) =>
        encode(b?.solution_path ?? "")
      )
    );
  }
  return all;
}

export const findPath: RequestHandler = async (req, res) => {
  const { id, source } = z
    .object({
      id: z.string(),
      source: z.enum(["ongoing", "submitted"]).default("submitted"),
    })
    .parse(req.params);
  return res.send(await getSolutionPath(id, source));
};
