import type { Dictionary } from "lodash";
import { range, zip } from "lodash";
import { checkEdgeCollision } from "./checks/checkEdgeCollision";
import { checkImmediateCollision } from "./checks/checkImmediateCollision";
import { CheckParams, CheckResult } from "./core/Check";
import { Domain } from "./core/Domain";
import { Point } from "./core/Point";
import { Reader } from "./core/Reader";
import { Seeker } from "./core/Seeker";
import { decode } from "./encode";
import { DoneException } from "./exceptions/DoneException";

type ValidationParameters = {
  paths: string[];
  domain: Domain;
  sources: Point[];
  goals?: Point[];
  checks?: ((args: CheckParams) => CheckResult)[];
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
  w: { x: 0, y: 0 },
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

function sumPositionsImperative(
  prev: Point[],
  out: Point[],
  time: number,
  actions: string[],
  offsetMap = defaultOffsetMap
) {
  for (let i = 0; i < prev.length; i++) {
    const action = actions[i][time];
    out[i].x = prev[i].x + (offsetMap[action]?.x ?? 0);
    out[i].y = prev[i].y + (offsetMap[action]?.y ?? 0);
  }
}

const swap = (grids: { prev: Point[]; next: Point[] }) => {
  const tmp = grids.prev;
  grids.prev = grids.next;
  grids.next = tmp;
};

export function validate({
  paths,
  domain,
  sources,
  goals = [],
  checks = [checkEdgeCollision, checkImmediateCollision],
  onError = () => false,
}: ValidationParameters) {
  const eachAgent = (f: (i: number) => void) => {
    for (let i = 0; i < sources.length; i++) {
      f(i);
    }
  };
  const allPaths = paths.map(decode);
  const timespan = Math.max(...allPaths.map((b) => b.length));
  const agents = {
    prev: structuredClone(sources),
    next: structuredClone(sources),
  };
  // Initialise grid
  const grid = range(domain.height).map(() =>
    range(domain.width).map(() => new Set<number>())
  );
  eachAgent((i) => {
    grid[agents.next[i].y]?.[agents.next[i].x]?.add?.(i);
  });
  //
  let i = 0;
  while (i <= timespan) {
    // console.log(i);
    sumPositionsImperative(agents.prev, agents.next, i, allPaths);
    for (const check of checks) {
      const result = check({
        timestep: i + 1,
        prev: agents.prev,
        next: agents.next,
        domain,
        sources,
        goals,
        paths: allPaths,
        grid,
        stage: "pre",
      });
      // Stop validation if onError returns true.
      if (result.errors?.length && onError(result)) return false;
    }
    eachAgent((a) => {
      // Current position could be out of bounds
      grid[agents.prev[a].y]?.[agents.prev[a].x]?.delete?.(a);
      // Could have went out of bounds
      grid[agents.next[a].y]?.[agents.next[a].x]?.add?.(a);
    });
    for (const check of checks) {
      const result = check({
        timestep: i + 1,
        prev: agents.prev,
        next: agents.next,
        domain,
        paths: allPaths,
        sources,
        goals,
        grid,
        stage: "post",
      });
      // Stop validation if onError returns true.
      if (result.errors?.length && onError(result)) return false;
    }

    swap(agents);
    i++;
  }
  for (const check of checks) {
    const result = check({
      stage: "final",
      timestep: i,
      current: agents.prev,
      domain,
      paths: allPaths,
      sources,
      goals,
    });
    // Stop validation if onError returns true.
    if (result.errors?.length && onError(result)) return false;
  }
}
