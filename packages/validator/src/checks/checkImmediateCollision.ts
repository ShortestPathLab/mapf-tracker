import { CheckParameters, CheckResult } from "../core/Check";
import { serialisePoint as $ } from "../core/Point";
import { chain as _, head } from "lodash";

export function checkImmediateCollision({
  next,
  timestep,
}: CheckParameters): CheckResult {
  const a = next.map($);
  const hasCollision = new Set(a).size !== a.length;
  if (!hasCollision) return {};
  const collision = _(next)
    .map((c, i) => [c, i] as const)
    .groupBy(([c]) => $(c))
    .values()
    .find((agents) => agents.length > 1)
    .value();
  const [p] = head(collision);
  return {
    errorAgents: collision.map(([, i]) => i),
    errors: [
      `agent-to-agent direct collision, agents ${collision
        .map(([, i]) => i)
        .join(" and ")}, at timestep ${timestep} ${$(p)}`,
    ],
  };
}
