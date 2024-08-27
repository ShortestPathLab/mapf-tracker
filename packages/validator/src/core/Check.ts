import { Domain } from "../core/Domain";
import { Point } from "../core/Point";

export type CheckResult = {
  errors?: string[];
  errorAgents?: number[];
};
export type CheckParameters = {
  prev: Point[];
  next: Point[];
  actions: string[];
  domain: Domain;
  sources: Point[];
  timestep: number;
  goals?: Point[];
  done?: boolean[];
};

export type FinalCheckParameters = {
  current: Point[];
  domain: Domain;
  sources: Point[];
  timestep: number;
  goals?: Point[];
};
