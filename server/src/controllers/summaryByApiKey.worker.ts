import { connectToDatabase } from "connection";
import {
  chain,
  countBy,
  groupBy,
  head,
  isUndefined,
  keyBy,
  mapValues,
  once,
} from "lodash";
import { Infer, Instance, Map, OngoingSubmission, Scenario } from "models";
import { usingTaskMessageHandler } from "queue/usingWorker";
import { z } from "zod";

export const path = import.meta.path;

const connect = once(connectToDatabase);

const generateIndexes = once(async () => {
  await connectToDatabase();
  const maps = await Map.find({}, { _id: 1, map_name: 1 });
  const scenarios = Scenario.find(
    {},
    { _id: 1, map_id: 1, type_id: 1, scen_type: 1 }
  );
  return {
    maps: keyBy(maps, "_id"),
    scenarios: keyBy(await scenarios, "_id"),
  };
});

const CHUNK = 2 ** 14;

const run = async (params: unknown) => {
  const indexes = await generateIndexes();
  const data = z
    .object({
      apiKey: z.string(),
      page: z
        .number()
        .nonnegative()
        .or(z.string().transform(Number))
        .default(0),
    })
    .parse(params);
  const docs: (Pick<Infer<typeof OngoingSubmission>, "validation" | "cost"> & {
    expected: number;
    scen_id: string;
  })[] = await OngoingSubmission.aggregate(
    [
      { $match: { apiKey: data.apiKey } },
      { $skip: data.page * CHUNK },
      { $limit: CHUNK },
      {
        $project: {
          validation: 1,
          instance: 1,
          cost: 1,
        },
      },
      {
        $lookup: {
          from: Instance.collection.collectionName,
          localField: "instance",
          foreignField: "_id",
          as: "instance",
        },
      },
      {
        $addFields: {
          scen_id: { $first: "$instance.scen_id" },
          expected: { $first: "$instance.solution_cost" },
        },
      },
      {
        $project: {
          validation: 1,
          cost: 1,
          expected: 1,
          scen_id: 1,
        },
      },
    ],
    { allowDiskUse: true }
  );
  const submissions = docs.map((d) => {
    const scenario = indexes.scenarios[d.scen_id!.toString()];
    if (!scenario) throw "Scenario not found";
    const map = indexes.maps[scenario.map_id!.toString()];
    return { submission: d, scenario, map };
  });
  const novelty = (c: typeof submissions) =>
    mapValues(
      groupBy(
        c.filter((d) => d.submission.validation?.outcome === "valid"),
        (d) =>
          isUndefined(d.submission.cost)
            ? "unknown"
            : d.submission.cost <
              (d.submission.expected ?? Number.MAX_SAFE_INTEGER)
            ? "best"
            : d.submission.cost ===
              (d.submission.expected ?? Number.MAX_SAFE_INTEGER)
            ? "tie"
            : "dominated"
      ),
      "length"
    );

  const count = (c: typeof submissions) => ({
    valid: 0,
    invalid: 0,
    queued: 0,
    outdated: 0,
    ...countBy(c, (d) => d.submission.validation?.outcome),
    ...novelty(c),
    total: c.length,
  });

  const maps = chain(submissions)
    .groupBy("map._id")
    .mapValues((v) => ({
      name: head(v)!.map.map_name,
      id: head(v)!.map._id.toString(),
      count: count(v),
      scenarios: chain(v)
        .groupBy((v) => `${v.scenario.scen_type}-${v.scenario.type_id}`)
        .map((d) => ({
          type: head(d)!.scenario.scen_type,
          typeId: head(d)!.scenario.type_id,
          id: head(d)!.scenario._id.toString(),
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

export type SummaryByApiKeyResult = Awaited<ReturnType<typeof run>>;

if (!Bun.isMainThread) {
  self.onmessage = usingTaskMessageHandler(async (d) => {
    await connect();
    return await run(d);
  });
}
