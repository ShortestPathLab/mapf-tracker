import { RequestHandler } from "express";
import { chunk, last, map, split, zipWith } from "lodash";
import {
  Instance,
  OngoingSubmission,
  Scenario,
  SolutionPath,
  Submission,
} from "models";
import { Types } from "mongoose";
import { route } from "query";
import { encode } from "validator";
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

export async function getSolutionPathsRaw(ids: string[]) {
  const chunks = chunk(ids, 250);
  const all: string[] = [];
  for (const c of chunks) {
    const q = {
      _id: {
        $in: map(c, (id) => new Types.ObjectId(id)),
      },
    };
    const [dataLegacy, data] = await Promise.all([
      SolutionPath.find(q, { solution_path: 1 }),
      Submission.find(q, { solutions: 1 }),
    ]);
    const x = zipWith(
      data,
      dataLegacy,
      (a, b) => a?.solutions?.join("\n") ?? encode(b?.solution_path ?? "")
    );
    all.push(...x);
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
