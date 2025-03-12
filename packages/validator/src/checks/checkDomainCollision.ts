import { CheckParams, CheckResult } from "../core/Check";
import { serialisePoint as $ } from "../core/Point";

export function checkDomainCollision(params: CheckParams): CheckResult {
  if (params.stage !== "post") return {};

  const { prev, domain, timestep } = params;
  const agent = prev.findIndex(({ x, y }) => domain.cells[y][x]);
  if (agent !== -1) {
    return {
      errorTimesteps: [timestep],
      errorAgents: [agent],
      errors: [
        `agent ${agent} collision with environment, at timestep ${timestep}, ${$(
          prev[agent]
        )}`,
      ],
    };
  } else {
    return {};
  }
}
