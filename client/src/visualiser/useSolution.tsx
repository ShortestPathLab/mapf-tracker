import randomColor from "randomcolor";
import { useEffect, useMemo, useState } from "react";
import { APIConfig } from "../config";
import memoizee from "memoizee";
import {
  DoneException,
  Reader,
  Seeker,
  createActionMap,
  createOffsetMap,
  sumPositions,
} from "validator";
import { chain, memoize } from "lodash";

/**
 * pre-processing step for visualising obstacles
 * @param {string} text newline-delimited content of a `.map` file
 * @returns
 */
function parseMap(map: string): boolean[][] {
  // ignore the top 4 lines, we only want the map data...
  // ...which is separated by rows: \n, columns: ""
  const mapContent = map.trim().split(/\r?\n/).slice(4);

  // now convert any obstacles to "true" and free space to "false"
  return mapContent.map((row: any) =>
    [...row].map((val) => val === "@" || val === "T")
  );
}
/**
 * Pre-compute the action of every agent specified in text scene
 * @param {string} text newline-delimited content of a `.scen` file
 * @param {number} numAgents the number of agents in the solution path
 * @param {string} solutionString newline-delimited solution path for a particular instance
 */
function parseScen(scen: string, numAgents: number, solutionString: string) {
  // extract the content from the .scen file
  var scenContent = scen.trim().split(/\r?\n/);

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

type SolutionParameters = {
  path?: string;
  map?: string;
  scenario?: string;
  agentCount?: number;
};

export function processAgent(agent: string) {
  const reader = new Reader(agent);
  const seeker = new Seeker(reader, -1);
  return {
    seek: (n: number) => {
      try {
        return seeker.seek(n);
      } catch (e) {
        if (e instanceof DoneException) {
          return "w";
        } else throw e;
      }
    },
    done: (n: number) => {
      try {
        seeker.seek(n);
        return false;
      } catch (e) {
        if (e instanceof DoneException) {
          return true;
        } else throw e;
      }
    },
  };
}

function makeAgentPositionGetter(
  sources: { x: number; y: number }[],
  paths: string[]
) {
  const as = paths.map((c) => processAgent(c || "w"));
  const f = memoize((n: number): { x: number; y: number }[] => {
    if (n === 0) {
      return sources;
    } else {
      const offsets = createOffsetMap(createActionMap(n, as), {
        u: { x: 0, y: 1 },
        d: { x: 0, y: -1 },
        l: { x: -1, y: 0 },
        r: { x: 1, y: 0 },
      });
      return sumPositions(f(n - 1), offsets);
    }
  });
  return f;
}

export function useSolution({
  path,
  map,
  scenario,
  agentCount = 0,
}: SolutionParameters) {
  const [data, setData] = useState("");
  const [map2, setMap] = useState<boolean[][]>([[]]);

  const [color, setColor] = useState<string[]>([]);
  const [result, setResult] = useState<ReturnType<typeof parseScen>>();

  const { sources, paths } = result ?? {};

  useEffect(() => {
    fetch(`${APIConfig.apiUrl}/solution_path/${path}`, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        setData(data.solution_path);
      })
      .catch((err) => console.error(err));
  }, [path]);

  useEffect(() => {
    if (data.length === 0) return;
    const mapPath = `./assets/maps/${map}.map`;
    const scenPath = `./assets/scens/${scenario}.scen`;

    // generate one random color per agent
    setColor(
      Array.from({ length: agentCount }, (_, index) =>
        randomColor({ seed: 100 * index })
      )
    );

    Promise.all([
      fetch(mapPath).then((r) => r.text()),
      fetch(scenPath).then((r) => r.text()),
    ])
      .then(([map_text, scen_text]) => {
        setMap(parseMap(map_text));
        setResult(parseScen(scen_text, agentCount, data));
      })
      .catch(console.error);
  }, [data, agentCount]);

  const getAgentPosition = useMemo(
    () => makeAgentPositionGetter(sources ?? [], paths ?? []),
    [sources, paths]
  );

  return {
    map: map2,
    result,
    color,
    getAgentPosition,
  };
}
