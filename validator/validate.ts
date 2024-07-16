import { Item, List } from "linked-list";
import { chain, groupBy, some, times, zip } from "lodash-es";
import type { Dictionary } from "lodash";

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

class Chunk extends Item {
  constructor(
    public count: number,
    public symbol: string,
    public offset: number
  ) {
    super();
  }
}
export class DoneException extends Error {}
export class LowerOutOfRangeException extends Error {}

export interface Reader {
  read(): Chunk | undefined;
}

export class Reader {
  chunks: IterableIterator<RegExpExecArray>;
  offset = 0;
  constructor(agent: string) {
    this.chunks = agent.matchAll(/(\d*)([a-z])/g);
  }
  read() {
    const { value, done } = this.chunks.next();
    if (!done) {
      const [_, count, symbol] = value;
      const o = count ? +count : 1;
      const out = new Chunk(o, symbol, this.offset);
      this.offset += o;
      return out;
    } else {
      throw new DoneException();
    }
  }
}

function checkRange(n: number, chunk: Chunk) {
  const min = chunk.offset;
  const max = chunk.offset + chunk.count;
  return n < min ? "low" : min <= n && n < max ? "in-range" : "high";
}

export class Seeker {
  cache = new List<Chunk>();
  current: Chunk;
  /**
   * @param reader
   * @param history How many previous chunks to store.
   */
  constructor(public reader: Reader, public history = 2) {
    this.current = reader.read();
    this.cache.append(this.current);
  }
  prune() {
    let c = this.current;
    times(
      this.history,
      () => this.current.prev && (c = this.current.prev as Chunk)
    );
    if (c.prev) c.prev = null;
  }
  seek(n: number): string {
    const status = checkRange(n, this.current);
    switch (status) {
      case "in-range": {
        // In the right chunk
        return this.current.symbol;
      }
      case "low": {
        // Decrement chunk
        if (this.current.prev) {
          this.current = this.current.prev as Chunk;
          return this.seek(n);
        } else {
          // Ran out of previous chunks
          throw new LowerOutOfRangeException();
        }
      }
      case "high": {
        // Increment chunk
        if (this.current.next) {
          // Navigate forward in cache
          // Considering pruning cache here
          this.prune();
          this.current = this.current.next as Chunk;
          return this.seek(n);
        } else {
          // Can throw DoneException
          this.cache.append(this.reader.read());
          return this.seek(n);
        }
      }
    }
  }
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
