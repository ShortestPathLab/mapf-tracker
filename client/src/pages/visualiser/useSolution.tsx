import { useMemo } from "react";
import { APIConfig } from "core/config";
import {
  DoneException,
  Reader,
  Seeker,
  createActionMap,
  createOffsetMap,
  sumPositions,
} from "validator";
import { memoize } from "lodash";
import { parseMap } from "./parseMap";
import { parseScenario } from "./parseScenario";
import { useQuery } from "@tanstack/react-query";

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

function createAgentPositionGetter(
  sources: { x: number; y: number }[],
  paths: string[]
) {
  const as = paths.map((c) => processAgent(c || "w"));
  const f = memoize((n: number): { x: number; y: number }[] => {
    if (n === 0) {
      return sources;
    } else {
      // TODO: still using math origin! data in solution_paths has not been swapped over yet.
      const offsets = createOffsetMap(createActionMap(n - 1, as), {
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

type SolutionParameters = {
  solutionKey?: string;
  mapKey?: string;
  scenarioKey?: string;
  agentCount?: number;
};

export function useSolution({
  solutionKey,
  mapKey,
  scenarioKey,
  agentCount = 0,
}: SolutionParameters) {
  const { data: solutionData, isLoading: isSolutionDataLoading } = useQuery({
    queryKey: ["solution", solutionKey],
    queryFn: async () =>
      (
        await (
          await fetch(`${APIConfig.apiUrl}/solution_path/${solutionKey}`, {
            method: "get",
          })
        ).json()
      ).solution_path as string,
  });

  const { data: generalData, isLoading: isGeneralDataLoading } = useQuery({
    queryKey: ["solutionContextData", solutionData, mapKey, scenarioKey],
    queryFn: async () => {
      if (solutionData?.length) {
        const [mapData, scenarioData] = await Promise.all([
          (await fetch(`./assets/maps/${mapKey}.map`)).text(),
          (await fetch(`./assets/scens/${scenarioKey}.scen`)).text(),
        ]);
        return {
          map: parseMap(mapData),
          result: parseScenario(scenarioData, agentCount, solutionData),
        };
      }
    },
  });

  const { map, result } = generalData ?? {};
  const { sources, paths } = result ?? {};

  const getAgentPosition = useMemo(
    () => createAgentPositionGetter(sources ?? [], paths ?? []),
    [sources, paths]
  );

  return {
    isLoading: isSolutionDataLoading || isGeneralDataLoading,
    map: map ?? [],
    result,
    getAgentPosition,
  };
}
