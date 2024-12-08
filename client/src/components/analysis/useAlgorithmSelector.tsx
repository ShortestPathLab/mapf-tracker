import { BaseMetric, metrics } from "core/metrics";
import { find, head } from "lodash";
import { useState } from "react";
import { useList } from "react-use";
import { AxisDomain } from "recharts/types/util/types";

export type Slice = {
  key: string;
  name: string;
  formatter?: (a: string | number) => string;
  domain?: AxisDomain;
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
