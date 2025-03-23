import { Chart } from "components/analysis/Chart";
import ChartOptions from "components/analysis/ChartOptions";
import { SliceChart } from "components/analysis/SliceChart";
import {
  Slice,
  useSliceSelector,
} from "components/analysis/useAlgorithmSelector";
import { capitalize, chain, keyBy } from "lodash";
import { useScenarioData } from "queries/useScenarioQuery";

export const slices = [
  {
    key: "count",
    name: "Count",
  },
] satisfies Slice[];

export function AlgorithmByScenarioChart({ map }: { map: string }) {
  const algorithmSelectorState = useSliceSelector(slices);
  const { metric, slice, algorithms: selected } = algorithmSelectorState;
  const { data, isLoading } = useScenarioData(metric, map);
  return (
    <>
      <ChartOptions {...algorithmSelectorState} slices={slices} />
      <Chart
        isLoading={isLoading}
        style={{ flex: 1 }}
        data={chain(data)
          .map((c) => ({
            name: capitalize(`${c.scen_type}-${c.type_id}`),
            ...keyBy(c.solved_instances, "algo_name"),
          }))
          .sortBy("name")
          .value()}
        render={<SliceChart slice={slice} selected={selected} />}
      />
    </>
  );
}
