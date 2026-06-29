import { AlgorithmDetails } from "core/types";

export function inferOptimality({ instances_closed, instances_solved }: AlgorithmDetails) {
  return Math.abs((instances_closed ?? 0) / (instances_solved ?? 1)) >= 0.95;
}
