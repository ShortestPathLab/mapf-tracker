import { file, Glob } from "bun";
import { map, range, some, toLower } from "lodash";
import { log } from "logging";
import { Instance, Map, Scenario } from "models";
import { parseMapMeta } from "parser";
import { parse } from "path";
import { resourcesPath } from "resources";
import { PipelineStage } from "../../pipeline";
import { stage as updateInstances } from "../updateInstancesFromSubmissions";

const getSelfIdentifiedCollection = (name: string) => {
  const [a1] = name.split("-");
  return ["empty", "maze", "random", "room", "warehouse"].includes(toLower(a1))
    ? a1
    : undefined;
};

const getCityCollection = (name: string) =>
  some(map(["berlin", "boston", "paris"], (s) => name.startsWith(s)))
    ? "city"
    : undefined;

function getScenMeta(file: string) {
  // Example: [1, 'even', 'maze-32-32-2']
  const [c, b] = file.split("-").toReversed();
  return {
    type: b,
    variant: +c,
  };
}

function all<T, U>(items: Iterable<T>, f: (item: T) => U) {
  return Promise.all(Array.from(items).map(f));
}

const mapMeta = {
  original_link: "https://movingai.com/benchmarks/mapf/index.html",
  papers: `Roni Stern, Nathan Sturtevant, Ariel Felner, Sven Koenig, Hang Ma, Thayne Walker, Jiaoyang Li et al. "Multi-agent pathfinding: Definitions, variants, and benchmarks." In Proceedings of the International Symposium on Combinatorial Search (SoCS), 2019.`,
};

async function reset() {
  await Map.deleteMany({});
  await Scenario.deleteMany({});
  await Instance.deleteMany({});
  // Reset maps
  for await (const path of new Glob("**/*.map").scanSync({
    cwd: resourcesPath,
    absolute: true,
  })) {
    const mapName = parse(path).name;
    const collection =
      getCityCollection(mapName) ??
      getSelfIdentifiedCollection(mapName) ??
      // Default to game map.
      "game";
    const { width, height } = parseMapMeta(await file(path).text());
    const { id: mapId } = await new Map({
      map_name: mapName,
      map_size: `${width}x${height}`,
      map_type: collection,
      ...mapMeta,
    }).save();
    await all(
      new Glob(`**/${mapName}*.scen`).scanSync({
        cwd: resourcesPath,
        absolute: true,
      }),
      async (path) => {
        const scenName = parse(path).name;
        log.info(`Resetting ${scenName}`);
        const { type, variant } = getScenMeta(scenName);
        const { id: scenId } = await new Scenario({
          map_id: mapId,
          scen_type: type,
          type_id: variant,
        }).save();
        // Remove `version 1`.
        const lines = (await file(path).text()).trim().split("\n").slice(1);
        await all(range(lines.length), (i) =>
          new Instance({
            map_id: mapId,
            scen_id: scenId,
            agents: i + 1,
          }).save()
        );
      }
    );
  }
}

export const stage: PipelineStage = {
  key: "reset",
  destructive: true,
  run: async () => ({
    result: await reset(),
  }),
  dependents: [updateInstances],
  description: `
**Warning:** This is a destructive action. This deletes all content in the database. This action also takes several minutes to complete.

This pipeline resets the database by deleting all content, and rebuilding them with the maps and scenarios from the original files. The original files are read from \`${resourcesPath}\`.`,
};
