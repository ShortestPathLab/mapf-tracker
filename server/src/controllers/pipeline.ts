import { Status, run, stages } from "aggregations";
import { timeStamp } from "console";
import { RequestHandler } from "express";
import { chain, map } from "lodash";
import z from "zod";

const store: { [K in keyof typeof stages]?: Partial<Status> } = {};

export const getStatus: RequestHandler = (req, res) => {
  return res.json(
    chain(stages)
      .values()
      .map(({ key, dependents }) => ({
        key,
        dependents: map(dependents, "key"),
        status: store[key] ?? {
          status: "invalidated",
          stage: key,
          variables: {},
          timeStamp: undefined,
        },
      }))
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

export const runStage: RequestHandler = async (req, res) => {
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
        onProgress: (args) => {
          store[args.stage] = args;
        },
      }
    );
    res.status(200).send({});
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
};
