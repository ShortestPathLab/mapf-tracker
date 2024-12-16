import { Infer, Map, Scenario } from "models";
import { resourcesDevPath } from "./dev";
import { resourcesProductionPath } from "./production";
import { join } from "path";
import memoize from "p-memoize";

export const resourcesPath =
  process.env.NODE_ENV === "development"
    ? resourcesDevPath
    : resourcesProductionPath;

const contentCacheKey = ([{ map, scenario }]: [Data]) =>
  `${map?.map_name}-${scenario?.scen_type}-${scenario?.type_id}`;

type Data = {
  map: Infer<typeof Map>;
  scenario?: Infer<typeof Scenario>;
};

export const getScenario = memoize(
  async ({ scenario, map }: Data) =>
    await Bun.file(
      join(
        resourcesPath,
        `./scens/${map.map_name}-${scenario!.scen_type}-${
          scenario!.type_id
        }.scen`
      )
    ).text(),
  {
    cacheKey: contentCacheKey,
  }
);

export const getMap = memoize(
  async ({ map }: Data) =>
    await Bun.file(join(resourcesPath, `./maps/${map.map_name}.map`)).text(),
  {
    cacheKey: contentCacheKey,
  }
);
