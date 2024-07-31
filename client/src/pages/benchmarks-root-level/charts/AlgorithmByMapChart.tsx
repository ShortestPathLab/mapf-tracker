import { useTheme } from "@mui/material";
import { capitalize, chain, keyBy } from "lodash";
import { useMapData } from "queries/useAlgorithmQuery";
import { Chart } from "components/analysis/Chart";
import ChartOptions from "components/analysis/ChartOptions";
import {
  Slice,
  useAlgorithmSelector,
} from "components/analysis/useAlgorithmSelector";
import { sliceBarChartRenderer } from "components/analysis/sliceBarChartRenderer";
import { getAlgorithms } from "components/analysis/getAlgorithms";

export const slices = [
  {
    key: "count",
    name: "Count",
  },
] satisfies Slice[];

export function AlgorithmByMapChart() {
  const { palette } = useTheme();
  const algorithmSelectorState = useAlgorithmSelector(slices);
  const { metric, slice, selected } = algorithmSelectorState;
  const { data, isLoading } = useMapData(metric);
  const algorithms = getAlgorithms(data);
  return (
    <>
      <ChartOptions
        {...algorithmSelectorState}
        slices={slices}
        algorithms={algorithms}
      />
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
          algorithms,
          selected,
          mode: palette.mode,
        })}
      />
    </>
  );
}
