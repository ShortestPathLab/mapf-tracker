import { useTheme } from "@mui/material";
import { Chart } from "components/analysis/Chart";
import ChartOptions from "components/analysis/ChartOptions";
import { SliceChart } from "components/analysis/SliceChart";
import {
  Slice,
  useSliceSelector,
} from "components/analysis/useAlgorithmSelector";
import { formatLargeNumber } from "components/charts/CompletionByAlgorithmChart";
import { sample } from "components/charts/sample";
import { scenarioMetrics } from "core/metrics";
import { chain, keyBy, map } from "lodash";
import { useInstanceCollectionData } from "queries/useBenchmarksQuery";
import { useScenarioOnAgentGapData } from "queries/useScenarioQuery";
import {
  Area,
  AreaChart,
  Label,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
        gap: (c.solution_cost - c.lower_cost) / c.solution_cost,
      }))}
      render={
        <AreaChart margin={{ bottom: 32, top: 32, left: 16, right: 16 }}>
          <Tooltip
            formatter={(c) => formatPercentage(c as number)}
            cursor={{ fill: palette.action.disabledBackground }}
          />
          <YAxis tickFormatter={(c) => formatPercentage(c)} />
          <XAxis dataKey="agents">
            <Label value="Agent count" offset={-10} position="insideBottom" />
          </XAxis>
          <Legend verticalAlign="top" />
          <Area
            fill={tone(palette.mode, accentColors.blue)}
            fillOpacity={0.4}
            isAnimationActive={false}
            dataKey="gap"
            name="Percent difference"
          />
        </AreaChart>
      }
    />
  );
}

export const slices = [
  {
    key: "cost",
    name: "Cost",
    formatter: formatLargeNumber,
  },
] satisfies Slice[];

export function LowerBoundComparisonChart({
  scenario,
  map,
}: {
  map: string;
  scenario: string | number;
}) {
  const algorithmSelectorState = useSliceSelector(slices, scenarioMetrics);
  const { metric, slice, algorithms: selected } = algorithmSelectorState;
  const { data, isLoading } = useScenarioOnAgentGapData(metric, map, scenario);
  return (
    <>
      <ChartOptions
        {...algorithmSelectorState}
        metrics={scenarioMetrics}
        slices={slices}
      />
      <Chart
        isLoading={isLoading}
        data={chain(data)
          .map((c) => ({
            agents: c.agents,
            ...keyBy(c.record, "algo_name"),
          }))
          .sortBy("agents")
          .thru(sample(250))
          .value()}
        render={
          <SliceChart
            type="area"
            xAxisDataKey="agents"
            slice={slice}
            selected={selected}
            keyType="name"
          />
        }
      />
    </>
  );
}
