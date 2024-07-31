import { ScenarioLevelLocationState } from "pages/benchmarks-scenario-level/ScenarioLevelLocationState";

export type VisualiserLocationState = ScenarioLevelLocationState & {
  path_id: string;
  map_name: string;
  scen_string: string;
  num_agents: number;
};
