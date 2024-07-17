import { CheckParameters, CheckResult } from '../core/Check.ts';
import { Domain } from '../core/Domain.ts';
import { Point } from '../core/Point.ts';

export declare const contains: (d: Domain, p: Point) => boolean;
export declare function checkDomainOutOfBounds({ next, prev, domain, timestep, }: CheckParameters): CheckResult;
