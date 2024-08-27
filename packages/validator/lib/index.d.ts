import { Dictionary } from 'lodash';
import { Item } from 'linked-list';
import { List } from 'linked-list';

export declare function checkDomainCollision({ next, domain, timestep, }: CheckParameters): CheckResult;

export declare function checkDomainOutOfBounds({ next, prev, domain, timestep, }: CheckParameters): CheckResult;

export declare function checkEdgeCollision({ actions, next, prev, timestep, }: CheckParameters): CheckResult;

export declare function checkGoalReached({ current, goals, }: FinalCheckParameters): CheckResult;

export declare function checkImmediateCollision({ next, timestep, }: CheckParameters): CheckResult;

export declare type CheckParameters = {
    prev: Point[];
    next: Point[];
    actions: string[];
    domain: Domain;
    sources: Point[];
    timestep: number;
    goals?: Point[];
    done?: boolean[];
};

export declare function checkRange(n: number, chunk: Chunk): "low" | "in-range" | "high";

export declare type CheckResult = {
    errors?: string[];
    errorAgents?: number[];
};

export declare class Chunk extends Item {
    count: number;
    symbol: string;
    offset: number;
    constructor(count: number, symbol: string, offset: number);
}

export declare const contains: (d: Domain, p: Point) => boolean;

export declare const createActionMap: (timestep: number, agents: ReturnType<typeof processAgent>[]) => string[];

export declare const createOffsetMap: (actionMap: string[], offsetMap?: Dictionary<Point>) => Point[];

export declare const defaultOffsetMap: {
    u: {
        x: number;
        y: number;
    };
    d: {
        x: number;
        y: number;
    };
    l: {
        x: number;
        y: number;
    };
    r: {
        x: number;
        y: number;
    };
};

export declare type Domain = {
    width: number;
    height: number;
    /**
     * The contents of the domain, column then row.
     * Index via `cells[y][x]`.
     */
    cells: boolean[][];
};

export declare class DoneException extends Error {
}

export declare type FinalCheckParameters = {
    current: Point[];
    domain: Domain;
    sources: Point[];
    timestep: number;
    goals?: Point[];
};

export declare class LowerOutOfRangeException extends Error {
}

export declare type Point = {
    x: number;
    y: number;
};

export declare function processAgent(agent: string): {
    seek: (n: number) => string;
    done: (n: number) => boolean;
};

export declare interface Reader {
    read(): Chunk | undefined;
}

export declare class Reader {
    chunks: Iterator<RegExpExecArray, [string, string, string]>;
    offset: number;
    constructor(agent: string);
}

export declare class Seeker {
    reader: Reader;
    history: number;
    cache: List<Chunk>;
    current: Chunk;
    /**
     * @param reader
     * @param history How many previous chunks to store. Set to -1 to disable.
     */
    constructor(reader: Reader, history?: number);
    prune(): void;
    seek(n: number): string;
}

export declare const serialisePoint: ({ x, y }: Point) => string;

export declare const sumPositions: (as: Point[], bs: Point[]) => {
    x: number;
    y: number;
}[];

export declare function validate({ paths, domain, sources, goals, onTimestep, onFinish, onError, }: ValidationParameters): boolean;

declare type ValidationParameters = {
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

export { }
