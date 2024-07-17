import { CheckParameters, CheckResult } from "../core/Check.ts";
import { find } from "lodash-es";

export function checkDomainCollision({
  next,
  domain,
}: CheckParameters): CheckResult {
  const collision = find(next, ({ x, y }) => domain.cells[y][x]);
  return collision ? { errors: ["agent collision with environment"] } : {};
}
