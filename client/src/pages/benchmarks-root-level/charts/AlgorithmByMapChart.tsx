import { Chart } from "components/analysis/Chart";
import ChartOptions from "components/analysis/ChartOptions";
import { sliceBarChartRenderer } from "components/analysis/sliceBarChartRenderer";
import {
  Slice,
  useAlgorithmSelector,
} from "components/analysis/useAlgorithmSelector";
import { capitalize, chain, keyBy } from "lodash";
import { useMapData } from "queries/useAlgorithmQuery";

export const slices = [
  {
    key: "count",
    name: "Count",
  },
] satisfies Slice[];

export function AlgorithmByMapChart() {
  const algorithmSelectorState = useAlgorithmSelector(slices);
  const { metric, slice, selected } = algorithmSelectorState;
  const { data, isLoading } = useMapData(metric);
  return (
    <>
      <ChartOptions {...algorithmSelectorState} slices={slices} />
      <Chart
        isLoading={isLoading}
        style={{ flex: 1 }}
        data={chain(data)
          .map((c) => ({
            map: capitalize(c.map_name),
            ...keyBy(c.solved_instances, "algo_name"),
          }))
          .sortBy("map")
          .value()}
        render={sliceBarChartRenderer({
          xAxisDataKey: "map",
          slice,
          selected,
          keyType: "name",
        })}
      />
    </>
  );
}
