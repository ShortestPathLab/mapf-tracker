import { connectToDatabase } from "connection";
import { once } from "lodash";
import { Infer, Instance, Map, Scenario } from "models";
import memoize from "p-memoize";
import { parseMap, parseMapMeta, parseScenarioMeta } from "parser";
import { createPrecomputeHandler } from "query/withDiskCache";
import { usingTaskMessageHandler } from "queue/usingWorker";
import React from "react";
import { renderToString } from "react-dom/server";
import { getMap, getScenario } from "resources";
import { findInstance, findMap, findScenario } from "./findMemo";
import { optimiseGridMap } from "./optimiseGridMap";

export const { precompute, handler } = createPrecomputeHandler(
  import.meta.path,
  "map-preview",
  (p) => run(p),
  {
    precompute: async () => {
      const scenarios = await Scenario.find({}, { _id: 1 });
      const maps = await Map.find({}, { _id: 1 });

      return [
        ...scenarios.map(({ _id }) => [{ scenario: _id.toString() }]),
        ...maps.map(({ _id }) => [{ map: _id.toString() }]),
      ] as [{ scenario?: string; map?: string }][];
    },
  }
);

const connect = once(connectToDatabase);

const processMap = memoize(
  async (map: string) => {
    const mapContent = parseMap(map);
    const mapMeta = parseMapMeta(map);
    return { meta: mapMeta, bounds: optimiseGridMap(mapContent, mapMeta) };
  },
  { cacheKey: JSON.stringify }
);

const processScenario = memoize(
  async (scenario: string, agents?: number) => {
    return parseScenarioMeta(scenario, agents);
  },
  { cacheKey: JSON.stringify }
);

async function getSources({ map, instance, scenario }: CreatePreviewData) {
  const sources = {
    map: undefined as Infer<typeof Map> | undefined | null,
    instance: undefined as Infer<typeof Instance> | undefined | null,
    scenario: undefined as Infer<typeof Scenario> | undefined | null,
  };
  // Get instance
  if (instance) {
    sources.instance = await findInstance(instance);
  }
  // Get scenario
  if (sources.instance || scenario) {
    sources.scenario = await findScenario(
      scenario ?? sources.instance!.scen_id.toString()
    );
  }
  // Get map
  if (sources.scenario || map) {
    sources.map = await findMap(map ?? sources.scenario!.map_id.toString());
  }

  return sources;
}

const run = async (params: CreatePreviewData) => {
  const { map, scenario, instance } = await getSources(params);
  if (!map) return renderToString(<svg />);
  const { meta, bounds } = await processMap(await getMap({ map }));
  const { sources } = scenario
    ? await processScenario(
        await getScenario({ map, scenario }),
        instance?.agents
      )
    : { sources: [] };
  const preview = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={meta.width}
      height={meta.height}
    >
      <rect
        x="0"
        y="0"
        width={meta.width}
        height={meta.height}
        fill="var(--background)"
      />
      {bounds.map((bounds, i) => (
        <rect
          key={i}
          {...bounds}
          fill="var(--obstacle)"
          shapeRendering="optimizeSpeed"
        />
      ))}
      {sources.map((source, i) => (
        <rect
          key={i}
          {...source}
          width={1}
          height={1}
          fill="var(--agent)"
          shapeRendering="optimizeSpeed"
        />
      ))}
    </svg>
  );
  return renderToString(preview);
};

type CreatePreviewData = {
  map?: string;
  instance?: string;
  scenario?: string;
};

if (!Bun.isMainThread) {
  self.onmessage = usingTaskMessageHandler<CreatePreviewData, any>(
    async (d) => {
      await connect();
      return await run(d);
    }
  );
}
