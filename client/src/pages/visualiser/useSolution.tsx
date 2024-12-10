import { useQuery } from "@tanstack/react-query";
import { head, last, memoize } from "lodash";
import { parseMap, parseScenario } from "parser";
import { useAlgorithmForInstanceData } from "queries/useAlgorithmQuery";
import { useMapData, useScenarioData } from "queries/useBenchmarksQuery";
import { useInstanceData } from "queries/useInstanceQuery";
import { useSolutionData } from "queries/useSolutionQuery";
import { useMemo } from "react";
import {
  DoneException,
  Reader,
  Seeker,
  createActionMap,
  createOffsetMap,
  sumPositions,
} from "validator";

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
        u: { x: 0, y: -1 },
        d: { x: 0, y: 1 },
        l: { x: -1, y: 0 },
        r: { x: 1, y: 0 },
      });
      return sumPositions(f(n - 1), offsets);
    }
  });
  return f;
}

type SolutionParameters = {
  instanceId?: string;
  solutionId?: string;
  source?: "ongoing" | "submitted";
};

export function useSolution({
  instanceId,
  solutionId,
  source,
}: SolutionParameters) {
  const { data: instance, isLoading: isInstanceLoading } =
    useInstanceData(instanceId);
  const { data: history, isLoading: isHistoryLoading } =
    useAlgorithmForInstanceData(instanceId);
  const { data: solution, isLoading: isSolutionLoading } = useSolutionData(
    solutionId ?? last(head(history)?.solution_algos)?.submission_id,
    source
  );
  const { data: scenario, isLoading: isScenarioLoading } = useScenarioData(
    instance?.scen_id
  );
  const { data: mapMetaData, isLoading: isMapDataLoading } = useMapData(
    instance?.map_id
  );

  const { data: generalData, isLoading: isGeneralDataLoading } = useQuery({
    queryKey: ["solutionContextData", solutionId, source, instanceId],
    queryFn: async () => {
      console.log(solution, instance, mapMetaData, scenario);
      const [mapData, scenarioData] = await Promise.all([
        (await fetch(`/assets/maps/${mapMetaData.map_name}.map`)).text(),
        (
          await fetch(
            `/assets/scens/${mapMetaData.map_name}-${scenario.scen_type}-${scenario.type_id}.scen`
          )
        ).text(),
      ]);
      const t = {
        map: parseMap(mapData),
        result: parseScenario(
          scenarioData,
          instance.agents,
          solution.join("\n")
        ),
      };
      console.log(t);
      return t;
    },
    enabled: !!solution && !!instance && !!mapMetaData && !!scenario,
  });

  const { map, result } = generalData ?? {};
  const { sources, paths } = result ?? {};

  const getAgentPosition = useMemo(
    () => createAgentPositionGetter(sources ?? [], paths ?? []),
    [sources, paths]
  );

  return {
    isLoading:
      isGeneralDataLoading ||
      isInstanceLoading ||
      isHistoryLoading ||
      isSolutionLoading ||
      isScenarioLoading ||
      isMapDataLoading,
    map: map ?? [],
    result,
    getAgentPosition,
  };
}
