import { chain as _ } from "lodash";

export function getAlgorithms<K extends string>(
  data: { [K1 in K]: { algo_name: string }[] }[],
  collectionKey: K
): string[] {
  return _(data).flatMap(collectionKey).map("algo_name").uniq().sort().value();
}
