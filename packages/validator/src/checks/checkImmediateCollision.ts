import { CheckParameters, CheckResult } from "core/Check";
import { serialisePoint as $ } from "core/Point";
import { chain as _ } from "lodash-es";

export function checkImmediateCollision({
  next,
}: CheckParameters): CheckResult {
  const collision = _(next)
    .countBy($)
    .values()
    .find((count) => count > 1)
    .value();
  return collision
    ? {
        errors: ["agent-to-agent direct collision"],
      }
    : {};
}
