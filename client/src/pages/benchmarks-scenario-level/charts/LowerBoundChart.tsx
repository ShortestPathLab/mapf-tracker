import { useTheme } from "@mui/material";
import { Chart } from "components/analysis/Chart";
import ChartOptions from "components/analysis/ChartOptions";
import { getAlgorithms } from "components/analysis/getAlgorithms";
import { sliceBarChartRenderer } from "components/analysis/sliceBarChartRenderer";
import {
  Slice,
  useAlgorithmSelector,
} from "components/analysis/useAlgorithmSelector";
import { scenarioMetrics } from "core/metrics";
import { chain, keyBy, map } from "lodash";
import { useInstanceCollectionData } from "queries/useBenchmarksQuery";
import { useScenarioOnAgentGapData } from "queries/useScenarioQuery";
import { Bar, BarChart, Label, Legend, Tooltip, XAxis, YAxis } from "recharts";
import { accentColors, tone } from "utils/colors";
import { formatPercentage } from "utils/format";

export function LowerBoundChart({ scenario }: { scenario: string | number }) {
  const { palette } = useTheme();
  const { data, isLoading } = useInstanceCollectionData(scenario);
  return (
    <Chart
      isLoading={isLoading}
      data={map(data, (c) => ({
        ...c,
        gap: c.solution_cost / c.lower_cost - 1,
      }))}
      render={() => (
        <BarChart margin={{ bottom: 32, top: 32, left: 16, right: 16 }}>
          <Tooltip formatter={formatPercentage} />
          <YAxis tickFormatter={formatPercentage} />
          <XAxis dataKey="agents">
            <Label value="Agent count" offset={-10} position="insideBottom" />
          </XAxis>
          <Legend verticalAlign="top" />
          <Bar
            fill={tone(palette.mode, accentColors.blue)}
            isAnimationActive={false}
            dataKey="gap"
            name="Percent difference between best solution and lower-bound"
          />
        </BarChart>
      )}
    />
  );
}

export const slices = [
  {
    key: "cost",
    name: "Cost",
  },
] satisfies Slice[];

export function LowerBoundComparisonChart({
  scenario,
  map,
}: {
  map: string;
  scenario: string | number;
}) {
  const { palette } = useTheme();
  const algorithmSelectorState = useAlgorithmSelector(slices, scenarioMetrics);
  const { metric, slice, selected } = algorithmSelectorState;
  const { data, isLoading } = useScenarioOnAgentGapData(metric, map, scenario);
  const algorithms = getAlgorithms(data, "record");
  return (
    <>
      <ChartOptions
        {...algorithmSelectorState}
        metrics={scenarioMetrics}
        slices={slices}
        algorithms={algorithms}
      />
      <Chart
        isLoading={isLoading}
        data={chain(data)
          .map((c) => ({
            agents: c.agents,
            ...keyBy(c.record, "algo_name"),
          }))
          .sortBy("agents")
          .value()}
        render={sliceBarChartRenderer({
          xAxisDataKey: "agents",
          slice,
          algorithms,
          selected,
          mode: palette.mode,
        })}
      />
    </>
  );
}
