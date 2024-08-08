import { CheckParameters, CheckResult } from "../core/Check";
import { Domain } from "../core/Domain";
import { Point, serialisePoint as $ } from "../core/Point";
import { find } from "lodash";

export const contains = (d: Domain, p: Point) =>
  0 <= p.x && p.x < d.width && 0 <= p.y && p.y < d.height;

export function checkDomainOutOfBounds({
  next,
  prev,
  domain,
  timestep,
}: CheckParameters): CheckResult {
  const point = find(
    next.map((p, i) => [p, i] as const),
    ([p]) => !contains(domain, p)
  );

  if (point) {
    const [p, i] = point;
    return {
      errorAgents: [i],
      errors: [`agent ${i} out of bounds, at timestep ${timestep}, ${$(p)}`],
    };
  } else {
    return {};
  }
}
