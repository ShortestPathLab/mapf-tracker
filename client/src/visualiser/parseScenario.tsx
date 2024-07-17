import { Reader } from "validator";
import { chain } from "lodash";

export function parseScenario(
  scen: string,
  numAgents: number,
  solutionString: string
) {
  // extract the content from the .scen file
  const scenContent = scen.trim().split(/\r?\n/);

  scenContent.shift();

  const [, , width, height] = scenContent[0].split("\t");

  const sources = scenContent
    .map((line) => {
      const [, , , , x, y] = line.split("\t");
      return { x: +x, y: +y };
    })
    .slice(0, numAgents);

  const paths = solutionString.trim().split("\n");

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
