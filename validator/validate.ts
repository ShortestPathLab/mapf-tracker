import { chain, groupBy, some, zip } from "lodash-es";
import type { Dictionary } from "lodash";
import { Seeker } from "./Seeker";
import { Reader } from "./Reader";
import { DoneException } from "./DoneException";
import { Chunk } from "./Chunk";

type CheckResult = {
  errors?: string[];
};

type Point = { x: number; y: number };

type ValidationParameters = {
  paths: string[];
  domain: string;
  sources: Point[];
  checks?: ((
    prev: Point[],
    next: Point[],
    actions: string[],
    domain: string
  ) => CheckResult)[];
  /**
   * @returns Stops validation if return value is true, otherwise continue validation
   */
  onError?: (c: CheckResult) => boolean;
};

export function checkRange(n: number, chunk: Chunk) {
  const min = chunk.offset;
  const max = chunk.offset + chunk.count;
  return n < min ? "low" : min <= n && n < max ? "in-range" : "high";
}

function processAgent(agent: string) {
  const reader = new Reader(agent);
  const seeker = new Seeker(reader);
  return {
    seek: (n: number) => seeker.seek(n),
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

const serialisePoint = ({ x, y }: Point): string => `${x}.${y}`;

function checkImmediateCollision(
  prev: Point[],
  next: Point[],
  actions: string[],
  domain: string
) {
  const nextSet = groupBy(next);
  // if (intersection(nextSet)) {
  //   return {
  //     errors: [""],
  //   };
  // }
  return {};
}

export const defaultOffsetMap = {
  u: { x: 0, y: 1 },
  d: { x: 0, y: -1 },
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
    x: a!.x + b!.x,
    y: a!.y + b!.y,
  }));

export function validate({
  paths,
  domain,
  sources,
  checks = [checkImmediateCollision],
  onError = () => false,
}: ValidationParameters) {
  const as = paths.map(processAgent);
  let i = 0;
  let prev = sources;
  while (some(as, (c) => !c.done(i))) {
    const actions = createActionMap(i, as);
    const next = sumPositions(prev, createOffsetMap(actions));
    for (const check of checks) {
      const result = check(prev, next, actions, domain);
      // Stop validation if onError returns true.
      if (result.errors?.length && onError(result)) return false;
    }
    i++;
  }
}
