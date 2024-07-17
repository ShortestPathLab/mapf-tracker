import { Domain } from '../core/Domain.ts';
import { Point } from '../core/Point.ts';

export type CheckResult = {
    errors?: string[];
};
export type CheckParameters = {
    prev: Point[];
    next: Point[];
    actions: string[];
    domain: Domain;
    sources: Point[];
    timestep: number;
    goals?: Point[];
};
export type FinalCheckParameters = {
    current: Point[];
    domain: Domain;
    sources: Point[];
    timestep: number;
    goals?: Point[];
};
