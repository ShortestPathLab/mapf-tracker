import { useStableLocationState } from "hooks/useStableLocationState";
import { SolutionVisualisation } from "./SolutionVisualisation";
import { VisualiserLocationState } from "./VisualiserLocationState";

export default function () {
  const state = useStableLocationState<VisualiserLocationState>();
  return (
    <SolutionVisualisation
      instanceId={state.instanceId}
      solutionId={state.solutionId}
      source={state.source}
    />
  );
}
