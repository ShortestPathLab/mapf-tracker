import { CheckParameters, CheckResult, FinalCheckParameters } from './core/Check';
import { Domain } from './core/Domain';
import { Point } from './core/Point';
import { Dictionary } from 'lodash';

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
export declare function processAgent(agent: string): {
    seek: (n: number) => string;
    done: (n: number) => boolean;
};
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
export declare const createActionMap: (timestep: number, agents: ReturnType<typeof processAgent>[]) => string[];
export declare const createOffsetMap: (actionMap: string[], offsetMap?: Dictionary<Point>) => Point[];
export declare const sumPositions: (as: Point[], bs: Point[]) => {
    x: number;
    y: number;
}[];
export declare function validate({ paths, domain, sources, goals, onTimestep, onFinish, onError, }: ValidationParameters): boolean;
export {};
