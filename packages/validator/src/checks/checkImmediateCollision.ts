import {
  TimestepCheckParameters,
  CheckResult,
  CheckParams,
} from "../core/Check";
import { serialisePoint as $ } from "../core/Point";
import { chain as _, find, head } from "lodash";

export function checkImmediateCollision(params: CheckParams): CheckResult {
  if (params.stage !== "post") return {};
  const { prev, grid, timestep } = params;
  const agent = prev.findIndex(({ x, y }) => grid[y][x].size > 1);
  if (agent === -1) return {};
  const point = prev[agent];
  const collision = grid[point.y]?.[point.x];
  return {
    errorTimesteps: [timestep],
    errorAgents: [agent],
    errors: [
      `agent-to-agent direct collision, agents ${agent} and ${[
        ...collision,
      ]}, at timestep ${timestep}`,
    ],
  };
}
