import { CheckResult, FinalCheckParameters } from "../core/Check.ts";
import { serialisePoint as $ } from "../core/Point.ts";
import { find, zip } from "lodash-es";

export function checkGoalReached({
  current,
  goals,
}: FinalCheckParameters): CheckResult {
  const fail = find(zip(current, goals), ([p1, p2]) => $(p1) !== $(p2));
  return fail ? { errors: ["agent did not reach goal"] } : {};
}
