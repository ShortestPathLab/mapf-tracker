import { CheckParameters, CheckResult } from "../core/Check";
import { find } from "lodash-es";

export function checkDomainCollision({
  next,
  domain,
  timestep,
}: CheckParameters): CheckResult {
  const collision = find(next, ({ x, y }) => domain.cells[y][x]);
  return collision
    ? {
        errors: [
          `agent collision with environment, at timestep ${timestep}, position=${JSON.stringify(
            collision
          )}`,
        ],
      }
    : {};
}
