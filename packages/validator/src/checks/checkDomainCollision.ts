import { CheckParameters, CheckResult } from "../core/Check";
import { find } from "lodash";
import { serialisePoint as $ } from "../core/Point";

export function checkDomainCollision({
  next,
  domain,
  timestep,
}: CheckParameters): CheckResult {
  const point = find(
    next.map((c, i) => [c, i] as const),
    ([{ x, y }]) => domain.cells[y][x]
  );
  if (point) {
    const [p, i] = point;
    return {
      errorTimesteps: [timestep],
      errorAgents: [i],
      errors: [
        `agent ${i} collision with environment, at timestep ${timestep}, ${$(
          p
        )}`,
      ],
    };
  } else {
    return {};
  }
}
