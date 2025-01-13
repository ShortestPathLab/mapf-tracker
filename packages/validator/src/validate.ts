import {
  CheckParameters,
  CheckResult,
  FinalCheckParameters,
} from "./core/Check";
import { checkImmediateCollision } from "./checks/checkImmediateCollision";
import { Domain } from "./core/Domain";
import { Point } from "./core/Point";
import { Reader } from "./core/Reader";
import { Seeker } from "./core/Seeker";
import { DoneException } from "./exceptions/DoneException";
import type { Dictionary } from "lodash";
import { some, zip } from "lodash";
import { checkEdgeCollision } from "./checks/checkEdgeCollision";
import { decode } from "./encode";

type ValidationParameters = {
  paths: string[];
  domain: Domain;
  sources: Point[];
  goals?: Point[];
  onTimestep?: ((args: CheckParameters) => CheckResult)[];
  onFinish?: ((args: FinalCheckParameters) => CheckResult)[];
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

export function processAgentSimple(agent: string) {
  const decoded = decode(agent);
  return {
    seek: (n: number) => {
      return decoded[n] || "w";
    },
    done: (n: number) => {
      return n >= decoded.length;
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
    x: (a?.x ?? 0) + (b?.x ?? 0),
    y: (a?.y ?? 0) + (b?.y ?? 0),
  }));

export function validate({
  paths,
  domain,
  sources,
  goals = [],
  onTimestep = [checkImmediateCollision, checkEdgeCollision],
  onFinish = [],
  onError = () => false,
}: ValidationParameters) {
  const as = paths.map(processAgentSimple);
  let i = 0;
  let prev = sources;
  while (some(as, (c) => !c.done(i))) {
    const actions = createActionMap(i, as);
    const next = sumPositions(prev, createOffsetMap(actions));
    const done = as.map((c) => c.done(i));
    for (const check of onTimestep) {
      const result = check({
        timestep: i,
        prev,
        next,
        actions,
        domain,
        sources,
        goals,
        done,
      });
      // Stop validation if onError returns true.
      if (result.errors?.length && onError(result)) return false;
    }
    prev = next;
    i++;
  }
  for (const check of onFinish) {
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
