import { Map } from "models";
import { Scenario } from "models";
import { Instance } from "models";
import { debounce, keyBy } from "lodash";
import { createCache } from "query";
import { connectToDatabase } from "connection";
import { log } from "logging";
import { QueryOptions } from "mongoose";

const opts: QueryOptions = {
  batchSize: Number.MAX_SAFE_INTEGER,
  lean: true,
};

export const g = async () => {
  log.info("Generating indexes for the first time");
  await connectToDatabase();
  const maps = await Map.find({}, { _id: 1, map_name: 1 }, opts);
  const scenarios = await Scenario.find({}, { _id: 1, map_id: 1, type_id: 1, scen_type: 1 }, opts);
  const instances = await Instance.find(
    {},
    { _id: 1, scen_id: 1, solution_cost: 1, lower_cost: 1 },
    opts,
  );
  log.info("Indexes generated");
  return {
    maps: keyBy(maps, "_id"),
    scenarios: keyBy(scenarios, "_id"),
    instances: keyBy(instances, "_id"),
  };
};

export const [generateIndexes, generateIndexesCache] = createCache(g);

const watch = [Map, Scenario, Instance];

const clear = debounce(() => generateIndexesCache.clear(), 1000);

for (const w of watch) {
  w.watch().on("change", clear);
}
