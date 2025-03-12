import { isEqual } from "lodash";
import { CheckParams, CheckResult } from "../core/Check";
import { serialisePoint as $ } from "../core/Point";

export function checkEdgeCollision(params: CheckParams): CheckResult {
  if (params.stage !== "pre") return {};
  const { grid, next, prev, timestep, paths } = params;
  const collision = next.findIndex((nextPosition, agent) => {
    const target = grid[nextPosition.y]?.[nextPosition.x];
    const action = paths[agent][timestep - 1];
    // Check if the tile was previously occupied
    if (
      // Tile moved
      action &&
      action !== "w" &&
      target &&
      // Tile was previously occupied
      target.size
    ) {
      const [first] = target;
      // If the tile was previously occupied,
      // the agent must not have moved backwards into the same tile.
      return isEqual(next[first], prev[agent]);
    } else {
      return false;
    }
  });

  if (collision !== -1) {
    const conflict = {
      agentA: collision,
      point: next[collision],
      agentB: grid[next[collision].y]?.[next[collision].x],
    };
    return {
      errorTimesteps: [timestep],
      errorAgents: [conflict.agentA, ...conflict.agentB],
      errors: [
        `agent-to-agent edge collision, agent ${
          conflict.agentA
        }, at timestep ${timestep}, at ${$(conflict.point)}, with agent ${[
          ...conflict.agentB,
        ]}`,
      ],
    };
  } else {
    return {};
  }
}
