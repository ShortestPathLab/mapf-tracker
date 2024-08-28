import { CheckParameters, CheckResult } from '../core/Check';
import { Domain } from '../core/Domain';
import { Point } from '../core/Point';

export declare const contains: (d: Domain, p: Point) => boolean;
export declare function checkDomainOutOfBounds({ next, prev, domain, timestep, }: CheckParameters): CheckResult;
