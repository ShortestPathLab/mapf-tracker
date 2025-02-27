import { useQuery } from "@tanstack/react-query";
import { head, last, memoize, pick } from "lodash";
import { parseMap, parseScenario } from "parser";
import { useAlgorithmForInstanceData } from "queries/useAlgorithmQuery";
import { useMapData, useScenarioDetailsData } from "queries/useBenchmarksQuery";
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
import { optimiseGridMap } from "./optimiseGridMap";
import { useOngoingSubmissionByIdQuery } from "queries/useOngoingSubmissionQuery";

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

const defaultOffsetMap = {
  u: { x: 0, y: -1 },
  d: { x: 0, y: 1 },
  l: { x: -1, y: 0 },
  r: { x: 1, y: 0 },
};

function createAgentPositionGetter(
  sources: { x: number; y: number }[],
  paths: string[]
) {
  const as = paths.map((c) => processAgent(c || "w"));
  const getAgentPositions = memoize((t: number): { x: number; y: number }[] => {
    if (t === 0) {
      return sources;
    } else {
      // TODO: still using math origin! data in solution_paths has not been swapped over yet.
      const offsets = createOffsetMap(
        createActionMap(t - 1, as),
        defaultOffsetMap
      );
      return sumPositions(getAgentPositions(t - 1), offsets);
    }
  });
  const bs = paths.map((c) => processAgent(c || "w"));
  const getAgentPosition = memoize(
    (n: number): { action?: string; x: number; y: number }[] => {
      let t = 0;
      const path: { x: number; y: number; action?: string }[] = [sources[n]];
      while (!bs[n].done(t)) {
        const [offset] = sumPositions(
          [pick(last(path), "x", "y")],
          createOffsetMap(createActionMap(t, [bs[n]]), defaultOffsetMap)
        );
        path.push({ ...offset, action: bs[n].seek(t) });
        t++;
      }
      return path;
    }
  );
  return { getAgentPositions, getAgentPath: getAgentPosition };
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

  // Only ongoing submissions have diagnostics
  const { data: ongoingSubmission, isLoading: isDiagnosticsLoading } =
    useOngoingSubmissionByIdQuery(
      source === "ongoing" ? solutionId : undefined
    );

  const { data: scenario, isLoading: isScenarioLoading } =
    useScenarioDetailsData(instance?.scen_id);
  const { data: mapMetaData, isLoading: isMapDataLoading } = useMapData(
    instance?.map_id
  );

  const { data: generalData, isLoading: isGeneralDataLoading } = useQuery({
    queryKey: ["solutionContextData", solutionId, source, instanceId],
    queryFn: async () => {
      const [mapData, scenarioData] = await Promise.all([
        (await fetch(`/assets/maps/${mapMetaData.map_name}.map`)).text(),
        (
          await fetch(
            `/assets/scens/${mapMetaData.map_name}-${scenario.scen_type}-${scenario.type_id}.scen`
          )
        ).text(),
      ]);
      const parsedMap = parseMap(mapData);
      const parsedScenario = parseScenario(
        scenarioData,
        instance.agents,
        solution.join("\n")
      );
      return {
        optimisedMap: optimiseGridMap(parsedMap, {
          width: parsedScenario.x,
          height: parsedScenario.y,
        }),
        map: parsedMap,
        result: parsedScenario,
      };
    },
    enabled: !!solution && !!instance && !!mapMetaData && !!scenario,
  });

  const { map, result, optimisedMap } = generalData ?? {};
  const { sources, paths } = result ?? {};

  const getters = useMemo(
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
      isMapDataLoading ||
      isDiagnosticsLoading,
    map: map ?? [],
    optimisedMap: optimisedMap ?? [],
    result,
    diagnostics: ongoingSubmission?.validation,
    ...getters,
  };
}
