import { CheckParameters, CheckResult } from "../core/Check";
import { serialisePoint as $, serialisePoint } from "../core/Point";
import { chain as _, find } from "lodash";

export function checkEdgeCollision({
  actions,
  next,
  prev,
  timestep,
}: CheckParameters): CheckResult {
  const hashes = _(prev)
    .map((c, i) => ({ agent: i, point: c, action: actions[i] }))
    .keyBy(({ point }) => $(point))
    .value();
  const collision = find(
    next.map((c, i) => [c, i] as const),
    ([p, agent]) => {
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
    }
  );

  if (collision) {
    const [p, i] = collision;
    return {
      errorAgents: [i],
      errors: [
        `agent-to-agent edge collision, agent ${i}, at timestep ${timestep}, ${$(
          p
        )}`,
      ],
    };
  } else {
    return {};
  }
}
