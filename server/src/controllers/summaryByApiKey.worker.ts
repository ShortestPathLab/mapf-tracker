import { connectToDatabase } from "connection";
import { chain, countBy, groupBy, head, mapValues, once } from "lodash";
import { Infer, OngoingSubmission } from "models";
import { usingTaskMessageHandler } from "queue/usingWorker";
import { asyncMap } from "utils/waitMap";
import { z } from "zod";
import { findInstance, findScenario, findMap } from "./findMemo";

export const path = import.meta.path;

const connect = once(connectToDatabase);

const run = async (params: unknown) => {
  const data = z.object({ apiKey: z.string() }).parse(params);
  const docs: Pick<
    Infer<typeof OngoingSubmission>,
    "validation" | "instance" | "cost"
  >[] = await OngoingSubmission.aggregate([
    { $match: { apiKey: data.apiKey } },
    {
      $project: {
        validation: 1,
        instance: 1,
        cost: 1,
      },
    },
  ]);
  const submissions = await asyncMap(docs, async (d) => {
    const instance = await findInstance(d.instance.toString());
    const scenario = await findScenario(instance.scen_id.toString());
    const map = await findMap(scenario.map_id.toString());
    return { submission: d, scenario, map, instance };
  });
  const novelty = (c: typeof submissions) =>
    mapValues(
      groupBy(
        c.filter((d) => d.submission.validation.outcome === "valid"),
        (d) =>
          d.submission.cost <
          (d.instance.solution_cost ?? Number.MAX_SAFE_INTEGER)
            ? "best"
            : d.submission.cost ===
              (d.instance.solution_cost ?? Number.MAX_SAFE_INTEGER)
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
    ...countBy(c, (d) => d.submission.validation.outcome),
    ...novelty(c),
    total: c.length,
  });

  const maps = chain(submissions)
    .groupBy("map._id")
    .mapValues((v) => ({
      name: head(v).map.map_name,
      id: head(v).map._id.toString(),
      count: count(v),
      scenarios: chain(v)
        .groupBy((v) => `${v.scenario.scen_type}-${v.scenario.type_id}`)
        .map((d) => ({
          type: head(d).scenario.scen_type,
          typeId: head(d).scenario.type_id,
          id: head(d).scenario._id.toString(),
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
