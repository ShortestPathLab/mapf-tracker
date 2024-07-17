import {
  CheckParameters,
  CheckResult,
  FinalCheckParameters,
} from "./core/Check.ts";
import { checkImmediateCollision } from "./checks/checkImmediateCollision.ts";
import { Domain } from "./core/Domain.ts";
import { Point } from "./core/Point.ts";
import { Reader } from "./core/Reader.ts";
import { Seeker } from "./core/Seeker.ts";
import { DoneException } from "./exceptions/DoneException.ts";
import type { Dictionary } from "lodash";
import { some, zip } from "lodash-es";
import { checkEdgeCollision } from "./checks/checkEdgeCollision.ts";

type ValidationParameters = {
  paths: string[];
  domain: Domain;
  sources: Point[];
  goals?: Point[];
  checks?: ((args: CheckParameters) => CheckResult)[];
  finalChecks?: ((args: FinalCheckParameters) => CheckResult)[];
  /**
   * @returns Stops validation if return value is true, otherwise continue validation
   */
  onError?: (c: CheckResult) => boolean;
};

export function processAgent(agent: string) {
  const reader = new Reader(agent);
  const seeker = new Seeker(reader);
  return {
    seek: (n: number) => {
      try {
        return seeker.seek(n);
      } catch (e) {
        if (e instanceof DoneException) {
          return undefined;
        } else throw e;
      }
    },
    done: (n: number) => {
      try {
        seeker.seek(n);
        return false;
      } catch (e) {
        if (e instanceof DoneException) {
          return true;
        } else throw e;
      }
    },
  };
}

export const defaultOffsetMap = {
  u: { x: 0, y: -1 },
  d: { x: 0, y: 1 },
  l: { x: -1, y: 0 },
  r: { x: 1, y: 0 },
};

export const createActionMap = (
  timestep: number,
  agents: ReturnType<typeof processAgent>[]
) => agents.map(({ seek }) => seek(timestep));

export const createOffsetMap = (
  actionMap: string[],
  offsetMap: Dictionary<Point> = defaultOffsetMap
): Point[] => actionMap.map((a) => offsetMap[a] ?? { x: 0, y: 0 });

export const sumPositions = (as: Point[], bs: Point[]) =>
  zip(as, bs).map(([a, b]) => ({
    x: a.x + b.x,
    y: a.y + b.y,
  }));

export function validate({
  paths,
  domain,
  sources,
  goals = [],
  checks = [checkImmediateCollision, checkEdgeCollision],
  finalChecks = [],
  onError = () => false,
}: ValidationParameters) {
  const as = paths.map(processAgent);
  let i = 0;
  let prev = sources;
  while (some(as, (c) => !c.done(i))) {
    const actions = createActionMap(i, as);
    const next = sumPositions(prev, createOffsetMap(actions));
    for (const check of checks) {
      const result = check({
        timestep: i,
        prev,
        next,
        actions,
        domain,
        sources,
        goals,
      });
      // Stop validation if onError returns true.
      if (result.errors?.length && onError(result)) return false;
    }
    prev = next;
    i++;
  }
  for (const check of finalChecks) {
    const result = check({
      timestep: i,
      current: prev,
      domain,
      sources,
      goals,
    });
    // Stop validation if onError returns true.
    if (result.errors?.length && onError(result)) return false;
  }
}
