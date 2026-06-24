import { connectToDatabase } from "connection";
import { chain, head, once } from "lodash";
import { Infer, Submission } from "models";
import { Types } from "mongoose";
import { usingTaskMessageHandler } from "queue/usingWorker";
import { z } from "zod";

export const path = import.meta.path;

const connect = once(connectToDatabase);

const run = async (params: unknown) => {
  const data = z.object({ algorithm: z.string() }).parse(params);
  const docs: Pick<
    Infer<typeof Submission>,
    "algo_id" | "instance_id" | "map_id" | "scen_id"
  >[] = await Submission.aggregate([
    { $match: { algo_id: new Types.ObjectId(data.algorithm) } },
    {
      $project: {
        algo_id: 1,
        instance_id: 1,
        map_id: 1,
        scen_id: 1,
      },
    },
  ]);

  const count = (c: typeof docs) => ({
    total: c.length,
  });

  const maps = chain(docs)
    .groupBy("map_id")
    .mapValues((v) => ({
      id: head(v)!.map_id!.toString(),
      count: count(v),
      scenarios: chain(v)
        .groupBy((v) => v.scen_id)
        .map((d) => ({
          id: head(d)!.scen_id!.toString(),
          count: count(d),
        }))
        .value(),
    }))
    .values()
    .value();
  return {
    maps,
  };
};

export type SummaryByAlgorithmResult = Awaited<ReturnType<typeof run>>;

if (!Bun.isMainThread) {
  self.onmessage = usingTaskMessageHandler(async (d) => {
    await connect();
    return await run(d);
  });
}
