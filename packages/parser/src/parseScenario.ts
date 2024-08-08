import { Reader } from "validator";
import { chain, map } from "lodash-es";

export function parseScenarioMeta(scenarioData: string, agentCount?: number) {
  // extract the content from the .scen file
  const scenContent = scenarioData.trim().split(/\r?\n/);

  scenContent.shift();

  const [, , width, height] = scenContent[0].split("\t");

  const instances = scenContent
    .map((line) => {
      const [, , , , sourceX, sourceY, goalX, goalY] = line.split("\t");
      return {
        source: { x: +sourceX, y: +sourceY },
        goal: { x: +goalX, y: +goalY },
      };
    })
    .slice(0, agentCount || scenContent.length);
  return {
    sources: map(instances, "source"),
    goals: map(instances, "goal"),
    width: +width,
    height: +height,
  };
}

export function parseScenario(
  scenarioData: string,
  agentCount: number,
  solutionData: string
) {
  const { sources, width, height } = parseScenarioMeta(
    scenarioData,
    agentCount
  );

  const paths = solutionData.trim().split("\n");

  const timespan = chain(paths)
    .map((a) => {
      let i = 0;
      const reader = new Reader(a);
      while (true) {
        try {
          const chunk = reader.read();
          i += chunk?.count ?? 1;
        } catch (e) {
          break;
        }
      }
      return i;
    })
    .max()
    .value();

  return {
    paths,
    sources,
    x: width,
    y: height,
    timespan,
    agents: paths,
  };
}
