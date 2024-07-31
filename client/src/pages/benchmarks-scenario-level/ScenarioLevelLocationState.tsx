import { MapLevelLocationState } from "pages/benchmarks-map-level/MapLevelLocationState";

export type ScenarioLevelLocationState = MapLevelLocationState & {
  scenId: number;
  scenTypeID: number;
  scenType: string;
};
