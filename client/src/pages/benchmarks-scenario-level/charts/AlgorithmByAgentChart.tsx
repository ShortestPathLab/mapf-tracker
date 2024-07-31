import { useTheme } from "@mui/material";
import { capitalize, chain, keyBy } from "lodash";
import {
  useScenarioData,
  useScenarioOnAgentData,
} from "queries/useScenarioQuery";
import { Chart } from "components/analysis/Chart";
import ChartOptions from "components/analysis/ChartOptions";
import { sliceBarChartRenderer } from "components/analysis/sliceBarChartRenderer";
import {
  Slice,
  useAlgorithmSelector,
} from "components/analysis/useAlgorithmSelector";
import { getAlgorithms } from "components/analysis/getAlgorithms";

export const slices = [
  {
    key: "count",
    name: "Count",
  },
] satisfies Slice[];

export function AlgorithmByAgentChart({ map }: { map: string }) {
  const { palette } = useTheme();
  const algorithmSelectorState = useAlgorithmSelector(slices);
  const { metric, slice, selected } = algorithmSelectorState;
  const { data, isLoading } = useScenarioOnAgentData(metric, map);
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
          .map((c, i) => ({
            name: i + 1,
            ...keyBy(c.solved_instances, "algo_name"),
          }))
          .sortBy("name")
          .value()}
        render={sliceBarChartRenderer({
          slice,
          algorithms,
          selected,
          mode: palette.mode,
        })}
      />
    </>
  );
}
