import { MapLevelLocationState } from "pages/benchmarks-map-level/MapLevelLocationState";

export type ScenarioLevelLocationState = MapLevelLocationState & {
  scenId: string;
};
