import { Domain } from "../core/Domain";
import { Point } from "../core/Point";

export type CheckResult = {
  errors?: string[];
  errorAgents?: number[];
  errorTimesteps?: number[];
};
export type TimestepCheckParameters = {
  prev: Point[];
  next: Point[];
  domain: Domain;
  sources: Point[];
  timestep: number;
  goals?: Point[];
  grid?: Set<number>[][];
  paths?: string[];
};

export type FinalCheckParameters = {
  current: Point[];
  domain: Domain;
  sources: Point[];
  timestep: number;
  goals?: Point[];
  paths?: string[];
};

export type CheckParams =
  | ({
      stage: "pre";
    } & TimestepCheckParameters)
  | ({
      stage: "post";
    } & TimestepCheckParameters)
  | ({
      stage: "final";
    } & FinalCheckParameters);
