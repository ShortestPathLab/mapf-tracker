import { chain } from "lodash";

export function getAlgorithms(
  data: any[],
  collectionKey: string = "solved_instances"
): string[] {
  return chain(data)
    .flatMap(collectionKey)
    .map("algo_name")
    .uniq()
    .sort()
    .value();
}
