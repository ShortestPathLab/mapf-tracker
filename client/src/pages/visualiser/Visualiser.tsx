import { useLocationState } from "hooks/useNavigation";
import { VisualiserLocationState } from "./VisualiserLocationState";
import { SolutionVisualisation } from "./SolutionVisualisation";
import { useStableLocationState } from "hooks/useStableLocationState";

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
