import { Infer, Map, Scenario } from "models";
import { resourcesDevPath } from "./dev";
import { resourcesProductionPath } from "./production";
import { join } from "path";

export const resourcesPath =
  process.env.NODE_ENV === "development"
    ? resourcesDevPath
    : resourcesProductionPath;

type Data = {
  map: Infer<typeof Map>;
  scenario: Infer<typeof Scenario>;
};

export const getScenario = async ({ scenario, map }: Data) =>
  await Bun.file(
    join(
      resourcesPath,
      `./scens/${map.map_name}-${scenario.scen_type}-${scenario.type_id}.scen`
    )
  ).text();

export const getMap = async ({ map }: Data) =>
  await Bun.file(join(resourcesPath, `./maps/${map.map_name}.map`)).text();
