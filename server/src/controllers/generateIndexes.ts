import { Map } from "models";
import { Scenario } from "models";
import { Instance } from "models";
import { debounce, keyBy } from "lodash";
import { createCache } from "query";
import { connectToDatabase } from "connection";
import { log } from "logging";

export const g = async () => {
  log.info("Generating indexes for the first time");
  await connectToDatabase();
  const maps = Map.find({}, { _id: 1, map_name: 1 });
  const scenarios = Scenario.find(
    {},
    { _id: 1, map_id: 1, type_id: 1, scen_type: 1 },
  );
  const instances = Instance.find(
    {},
    { _id: 1, scen_id: 1, solution_cost: 1, lower_cost: 1 },
  );
  return {
    maps: keyBy(await maps, "_id"),
    scenarios: keyBy(await scenarios, "_id"),
    instances: keyBy(await instances, "_id"),
  };
};
export const [generateIndexes, generateIndexesCache] = createCache(g);

const watch = [Map, Scenario, Instance];

const clear = debounce(() => generateIndexesCache.clear(), 1000);

for (const w of watch) {
  w.watch().on("change", clear);
}
