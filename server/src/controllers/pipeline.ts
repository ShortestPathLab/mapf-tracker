import { run, stages } from "aggregations";
import type { Context } from "elysia";
import { status } from "elysia";
import { chain, map } from "lodash";
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

export const getStatus = async () =>
  chain(stages)
    .values()
    .map(async ({ key, dependents, description, destructive }) => ({
      key,
      description: description?.(),
      destructive,
      dependents: map(dependents, "key"),
      status: await get(key),
    }))
    .thru((c) => Promise.all(c))
    .value();

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
  (one?: boolean) =>
  async ({ params }: Context) => {
    const { data, success, error: zErr } = stageSchema.safeParse(params);
    if (!success) return status(400, zErr);
    run<any>(stages[data.stage as keyof typeof stages], {}, {
      one,
      onProgress: async (args) => {
        await set(args.stage, args);
      },
    });
    return {};
  };
