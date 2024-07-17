import { CheckParameters, CheckResult } from "../core/Check.ts";
import { Domain } from "../core/Domain.ts";
import { Point } from "../core/Point.ts";
import { find } from "lodash-es";

export const contains = (d: Domain, p: Point) =>
  0 <= p.x && p.x < d.width && 0 <= p.y && p.y < d.height;

export function checkDomainOutOfBounds({
  next,
  prev,
  domain,
  timestep,
}: CheckParameters): CheckResult {
  const collision = find(next, (p) => !contains(domain, p));
  return collision ? { errors: ["agent out of bounds"] } : {};
}
