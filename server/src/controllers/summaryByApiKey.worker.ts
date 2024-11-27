import { connectToDatabase } from "connection";
import { chain, head, memoize, once } from "lodash";
import { Instance, Map, OngoingSubmission, Scenario } from "models";
import { Types } from "mongoose";
import { usingTaskMessageHandler } from "queue/usingWorker";
import { asyncMap } from "utils/waitMap";
import { z } from "zod";

const findInstance = memoize((id: Types.ObjectId) => Instance.findById(id));
const findMap = memoize((id: Types.ObjectId) => Map.findById(id));
const findScenario = memoize((id: Types.ObjectId) => Scenario.findById(id));

export const path = import.meta.path;

const connect = once(connectToDatabase);

const run = async (params: unknown) => {
  const data = z.object({ apiKey: z.string() }).parse(params);
  const docs = await OngoingSubmission.find({ apiKey: data.apiKey });
  const submissions = await asyncMap(docs, async (d) => {
    const instance = await findInstance(d.instance);
    const scenario = await findScenario(instance.scen_id);
    const map = await findMap(scenario.map_id);
    return { submission: d, scenario, map };
  });
  const count = (c: typeof submissions) => ({
    outdated: c.filter((d) => d.submission.validation.outcome === "outdated")
      .length,
    valid: c.filter((d) => d.submission.validation.outcome === "valid").length,
    error: c.filter((d) => d.submission.validation.outcome === "invalid")
      .length,
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
