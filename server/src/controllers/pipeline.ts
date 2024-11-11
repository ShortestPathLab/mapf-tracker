import { Status, run, stages } from "aggregations";
import { timeStamp } from "console";
import { RequestHandler } from "express";
import { chain, map } from "lodash";
import { PipelineStatus } from "models";
import { get, set } from "models/PipelineStatus";
import z from "zod";

export const getStatus: RequestHandler = async (req, res) => {
  return res.json(
    await chain(stages)
      .values()
      .map(async ({ key, dependents, description, destructive }) => ({
        key,
        description,
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
      run(
        stages[data.stage],
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
      console.error(err);
      res.status(500).send({ error: err.message });
    }
  };
