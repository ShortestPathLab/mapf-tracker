import { find, head } from "lodash";
import { BaseMetric, Metric, metrics } from "core/metrics";
import { useState } from "react";
import { useList } from "react-use";

export type Slice = {
  key: string;
  name: string;
  formatter?: (a: any) => any;
  domain?: any;
};

export function useAlgorithmSelector<T extends BaseMetric>(
  slices: Slice[],
  m: BaseMetric[] = metrics
) {
  const [metric, setMetric] = useState<T["key"]>(head(m)?.key);
  const [selected, modifySelected] = useList<string>();
  const [slice, setSlice] = useState<(typeof slice)[number]["key"]>(
    head(slices)?.key
  );

  return {
    metric,
    setMetric,
    selected,
    setSelected: modifySelected.set,
    setSlice,
    slice: find(slices, (c) => c.key === slice),
  };
}
