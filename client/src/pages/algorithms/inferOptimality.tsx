import { AlgorithmDetails } from "core/types";

export function inferOptimality({
  instances_closed,
  instances_solved,
}: AlgorithmDetails) {
  return Math.abs(instances_closed / instances_solved) >= 0.95;
}
