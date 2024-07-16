import { CheckParameters, CheckResult } from "core/Check";
import { serialisePoint as $ } from "core/Point";
import { chain as _, find } from "lodash-es";

export function checkEdgeCollision({
  actions,
  next,
  prev,
}: CheckParameters): CheckResult {
  const hashes = _(prev)
    .map((c, i) => ({ agent: i, point: c, action: actions[i] }))
    .keyBy(({ point }) => $(point))
    .value();
  const collision = find(next, (p, agent) => {
    // Check if next was previously occupied by a tile.
    // No need to check if current agent is moving, the logic is the same.
    if ($(p) in hashes) {
      // If the tile was previously occupied,
      // the agent in that tile MUST have moved in the same
      // direction as the current agent.
      return actions[agent] !== hashes[$(p)].action;
    } else {
      return false;
    }
  });
  return collision
    ? {
        errors: ["agent-to-agent edge collision"],
      }
    : {};
}
