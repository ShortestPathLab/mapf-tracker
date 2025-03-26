import { head, map } from "lodash";
import { useSolution } from "./useSolution";
import { Visualisation } from "./Visualisation";

export function SolutionVisualisation({
  instanceId,
  solutionId,
  source,
}: {
  instanceId?: string;
  solutionId?: string;
  source?: "ongoing" | "submitted";
}) {
  const { result, diagnostics, ...rest } = useSolution({
    instanceId,
    solutionId,
    source,
  });
  return (
    <Visualisation
      diagnostics={map(diagnostics?.errors, ({ timesteps, agents, label }) => ({
        t: head(timesteps),
        agents,
        label,
      }))}
      goals={result?.goals}
      timespan={result?.timespan}
      width={result?.x}
      height={result?.y}
      {...rest}
    />
  );
}

export function MapVisualisation({
  mapId,
  scenarioId,
}: {
  mapId?: string;
  scenarioId?: string;
}) {
  const { result, optimisedMap, size, isLoading } = useSolution({
    mapId,
    scenarioId,
  });

  return (
    <Visualisation
      isLoading={isLoading}
      optimisedMap={optimisedMap}
      {...result}
      {...size}
      getAgentPositions={() => result?.sources}
      disablePlayback
    />
  );
}
