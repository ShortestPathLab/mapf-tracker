import { CheckParams, CheckResult, FinalCheckParameters } from "../core/Check";
import { serialisePoint as $ } from "../core/Point";
import { find, zip } from "lodash";

export function checkGoalReached(params: CheckParams): CheckResult {
  if (params.stage !== "final") return {};

  const { current, goals, timestep } = params;

  const fail = find(
    zip(current, goals).map(([p1, p2], i) => [p1, p2, i] as const),
    ([p1, p2]) => $(p1) !== $(p2)
  );
  if (fail) {
    const [p1, p2, i] = fail;
    return {
      errorTimesteps: [timestep],
      errorAgents: [i],
      errors: [
        `agent ${i} did not reach goal. Expected ${$(p2)}, got ${$(p1)}`,
      ],
    };
  } else return {};
}
