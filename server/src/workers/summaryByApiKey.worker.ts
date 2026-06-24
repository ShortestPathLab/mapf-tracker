import { connectToDatabase } from "connection";
import {
  chain,
  countBy,
  groupBy,
  head,
  isUndefined,
  mapValues,
  once
} from "lodash";
import { Infer, OngoingSubmission } from "models";
import { usingTaskMessageHandler } from "queue/usingWorker";
import { z } from "zod";
import { generateIndexes } from "utils/generateIndexes";

export const path = import.meta.path;

const connect = once(connectToDatabase);

export const CHUNK = 2 ** 15;

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
  const docs: Pick<
    Infer<typeof OngoingSubmission>,
    "validation" | "cost" | "instance" | "lowerBound"
  >[] = await OngoingSubmission.aggregate(
    [
      { $match: { apiKey: data.apiKey } },
      { $skip: data.page * CHUNK },
      { $limit: CHUNK },
      {
        $project: {
          "validation.outcome": 1,
          instance: 1,
          cost: 1,
          lowerBound: 1,
        },
      },
    ],
    { allowDiskUse: true, batchSize: Number.MAX_SAFE_INTEGER, },
  );
  const submissions = docs.map((d) => {
    const instance = indexes.instances[d.instance!.toString()];
    if (!instance) throw "Instance not found";
    const scenario = indexes.scenarios[instance.scen_id!.toString()];
    if (!scenario) throw "Scenario not found";
    const map = indexes.maps[scenario.map_id!.toString()];
    return { submission: d, scenario, map, instance };
  });
  const novelty = (c: typeof submissions) => {
    const validSubmissions = c.filter(
      (d) => d.submission.validation?.outcome === "valid",
    );
    const solutionNovelty = groupBy(validSubmissions, (d) =>
      isUndefined(d.submission.cost)
        ? "unknown"
        : d.submission.cost <
          (d.instance.solution_cost ?? Number.MAX_SAFE_INTEGER)
          ? "best"
          : d.submission.cost ===
            (d.instance.solution_cost ?? Number.MAX_SAFE_INTEGER)
            ? "tie"
            : "dominated",
    );
    const lbNovelty = groupBy(validSubmissions, (d) =>
      isUndefined(d.submission.lowerBound)
        ? "unknown"
        : d.submission.lowerBound > (d.instance.lower_cost ?? -1)
          ? "lb_best"
          : d.submission.lowerBound === (d.instance.lower_cost ?? -1)
            ? "lb_tie"
            : "lb_dominated",
    );
    return {
      ...mapValues(solutionNovelty, "length"),
      ...mapValues(lbNovelty, "length"),
    };
  };

  const count = (c: typeof submissions) => ({
    valid: 0,
    invalid: 0,
    queued: 0,
    outdated: 0,
    lb_best: 0,
    lb_tie: 0,
    lb_dominated: 0,
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
