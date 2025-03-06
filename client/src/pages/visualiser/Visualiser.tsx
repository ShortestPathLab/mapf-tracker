import { useLocationState } from "hooks/useNavigation";
import { VisualiserLocationState } from "./VisualiserLocationState";
import { SolutionVisualisation } from "./SolutionVisualisation";

export default function () {
  const state = useLocationState<VisualiserLocationState>();
  return (
    <SolutionVisualisation
      instanceId={state.instanceId}
      solutionId={state.solutionId}
      source={state.source}
    />
  );
}
