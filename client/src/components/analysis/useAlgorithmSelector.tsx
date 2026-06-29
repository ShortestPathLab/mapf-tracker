import { BaseMetric, metrics } from "core/metrics";
import { find, head } from "lodash";
import { useState } from "react";
import { useList } from "react-use";
import { AxisDomain } from "recharts/types/util/types";

export type Slice = {
  key: string;
  dataKey?: string;
  name: string;
  formatter?: (a: string | number) => string;
  domain?: AxisDomain;
};

export function useSliceSelector<T extends BaseMetric, U extends Slice>(
  slices: U[],
  m: readonly BaseMetric[] = metrics,
  initialAlgorithms: string[] = [],
) {
  const [metric, setMetric] = useState<T["key"] | undefined>(head(m)?.key as T["key"] | undefined);
  const [algorithms, modifySelected] = useList<string>(initialAlgorithms);
  const [slice, setSlice] = useState<U["key"] | undefined>(head(slices)?.key);

  return {
    metric,
    setMetric,
    algorithms,
    setAlgorithms: modifySelected.set,
    setSlice,
    slice: find(slices, (c) => c.key === slice),
  };
}
