import { ScenarioLevelLocationState } from "pages/benchmarks-scenario-level/ScenarioLevelLocationState";

export type VisualiserLocationState = ScenarioLevelLocationState & {
  source: "ongoing" | "submitted";
  solutionId?: string;
  instanceId: string;
};
