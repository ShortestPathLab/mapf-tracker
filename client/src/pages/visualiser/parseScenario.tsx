import { Reader } from "validator";
import { chain } from "lodash";

export function parseScenario(
  scenarioData: string,
  agentCount: number,
  solutionData: string
) {
  // extract the content from the .scen file
  const scenContent = scenarioData.trim().split(/\r?\n/);

  scenContent.shift();

  const [, , width, height] = scenContent[0].split("\t");

  const sources = scenContent
    .map((line) => {
      const [, , , , x, y] = line.split("\t");
      return { x: +x, y: +y };
    })
    .slice(0, agentCount);

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
    x: +width,
    y: +height,
    timespan,
    agents: paths,
  };
}
