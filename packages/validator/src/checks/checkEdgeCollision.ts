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
    ([nextPosition, agent]) => {
      // Check if the tile was previously occupied
      if (
        // Tile was previously occupied
        $(nextPosition) in hashes &&
        // Tile wasn't itself
        hashes[$(nextPosition)].agent !== agent
      ) {
        // If the tile was previously occupied,
        // the agent must not have moved backwards into the same tile.
        const previousOccupant = hashes[$(nextPosition)];
        return $(next[previousOccupant.agent]) === $(prev[agent]);
      } else {
        return false;
      }
    }
  );

  if (collision) {
    const [p, i] = collision;
    const conflict = hashes[$(p)];
    return {
      errorTimesteps: [timestep],
      errorAgents: [i],
      errors: [
        `agent-to-agent edge collision, agent ${i}, at timestep ${timestep}, from ${$(
          prev[i]
        )} to ${$(p)}, with agent ${conflict.agent}, from ${$(
          conflict.point
        )} to ${$(next[conflict.agent])}`,
      ],
    };
  } else {
    return {};
  }
}
