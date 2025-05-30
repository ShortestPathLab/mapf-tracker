import { Status, run, stages } from "aggregations";
import { timeStamp } from "console";
import { RequestHandler } from "express";
import { chain, has, map } from "lodash";
import { log } from "logging";
import { PipelineStatus } from "models";
import { get, set } from "models/PipelineStatus";
import z from "zod";

export async function restore() {
  const docs = await PipelineStatus.find({
    type: "running",
  });
  for (const doc of docs) {
    await doc.updateOne({ type: "invalidated" });
  }
}

export const getStatus: RequestHandler = async (req, res) => {
  return res.json(
    await chain(stages)
      .values()
      .map(async ({ key, dependents, description, destructive }) => ({
        key,
        description: description?.(),
        destructive,
        dependents: map(dependents, "key"),
        status: await get(key),
      }))
      .thru((c) => Promise.all(c))
      .value()
  );
};

const stageSchema = z
  .object({
    stage: z.string().refine((stage) => stage in stages, {
      message: "stage must be a key in stages",
    }),
  })
  .refine((data) => !!data.stage, {
    message: "stage must be defined",
  });

export const runStage =
  (one?: boolean): RequestHandler =>
  async (req, res) => {
    const { data, success, error } = stageSchema.safeParse(req.params);
    if (!success) {
      res.status(400).json(error);
      return;
    }
    try {
      run<any>(
        stages[data.stage as keyof typeof stages],
        {},
        {
          one,
          onProgress: async (args) => {
            await set(args.stage, args);
          },
        }
      );
      res.status(200).send({});
    } catch (err) {
      const message = inferErrorMessage(err);
      log.error("Pipeline error", { message });
      console.error(err);
      res.status(500).send({ error: message });
    }
  };
