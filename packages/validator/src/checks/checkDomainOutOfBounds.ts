import {
  TimestepCheckParameters,
  CheckResult,
  CheckParams,
} from "../core/Check";
import { Domain } from "../core/Domain";
import { Point, serialisePoint as $ } from "../core/Point";
import { find } from "lodash";

export const contains = (d: Domain, p: Point) =>
  0 <= p.x && p.x < d.width && 0 <= p.y && p.y < d.height;

export function checkDomainOutOfBounds(params: CheckParams): CheckResult {
  if (params.stage !== "post") return {};

  const { prev, domain, timestep } = params;
  const agent = prev.findIndex((p) => !contains(domain, p));

  if (agent !== -1) {
    return {
      errorTimesteps: [timestep],
      errorAgents: [agent],
      errors: [
        `agent ${agent} out of bounds, at timestep ${timestep}, ${$(
          prev[agent]
        )}`,
      ],
    };
  } else {
    return {};
  }
}
