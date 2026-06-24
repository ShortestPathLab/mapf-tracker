import { useTheme } from "@mui/material";
import { Chart } from "components/analysis/Chart";
import ChartOptions from "components/analysis/ChartOptions";
import { SliceChart } from "components/analysis/SliceChart";
import {
  Slice,
  useSliceSelector,
} from "components/analysis/useAlgorithmSelector";
import { useQueries } from "@tanstack/react-query";
import { formatLargeNumber } from "components/charts/CompletionByAlgorithmChart";
import { sample } from "components/charts/sample";
import { scenarioMetrics } from "core/metrics";
import { chain, fromPairs, keyBy, map, max, range, some } from "lodash";
import { algorithmQuery } from "queries/useAggregateQuery";
import { useAlgorithmsData } from "queries/useAlgorithmQuery";
import { useInstancesByScenario } from "queries/useMapQuery";
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
  const { data, isLoading } = useInstancesByScenario(scenario);
  return (
    <Chart
      isLoading={isLoading}
      data={map(data, (c) => ({
        ...c,
        gap: (c.solution_cost - c.lower_cost) / Math.max(c.lower_cost, 1)
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
    formatter: (n: string | number) => formatLargeNumber(+n),
  },
] satisfies Slice[];

// Per-agent cost comparison, rebuilt from /queries/aggregate/algorithm (one
// call per algorithm). `min` collapses the single submission per
// (algorithm, map, scenario, agent) tuple to its cost. `has_lower` keeps only
// rows that actually have a lower bound, matching the legacy getAgentLower
// match; `solved` does the same for solution cost.
const scenarioMetricConfig = {
  solutionCost: { value: "solution_cost", filterBy: "solved" },
  lower: { value: "lower_cost", filterBy: "has_lower" },
} as const;

export function LowerBoundComparisonChart({
  scenario,
  map,
}: {
  map: string;
  scenario: string | number;
}) {
  const algorithmSelectorState = useSliceSelector(slices, scenarioMetrics);
  const { metric, slice, algorithms: selected } = algorithmSelectorState;
  const { data: algorithms = [], isLoading: isAlgorithmsLoading } =
    useAlgorithmsData();
  const { value, filterBy } =
    scenarioMetricConfig[metric as keyof typeof scenarioMetricConfig] ??
    scenarioMetricConfig.solutionCost;
  const key = (slice ?? slices[0]).key;
  const { data, isLoading } = useQueries({
    queries: (map && scenario ? algorithms : []).map((a) =>
      algorithmQuery({
        algorithm: a._id,
        map: `${map}`,
        scenario: `${scenario}`,
        groupBy: "agents",
        value,
        operation: "min",
        filterBy,
      })
    ),
    combine: (results) => {
      const dictionaries = results.map((q) => keyBy(q.data, "_id"));
      const maxAgents =
        max(
          results.flatMap((q) => (q.data ?? []).map((d) => +(d._id ?? 0)))
        ) ?? 0;
      const data = range(1, maxAgents + 1).map((agents) => ({
        agents,
        ...fromPairs(
          algorithms.map((a, i) => [
            a.algo_name,
            { [key]: dictionaries[i]?.[agents]?.result },
          ])
        ),
      }));
      return {
        isLoading: isAlgorithmsLoading || some(results, "isLoading"),
        data,
      };
    },
  });
  return (
    <>
      <ChartOptions
        {...algorithmSelectorState}
        metrics={scenarioMetrics}
        slices={slices}
      />
      <Chart
        isLoading={isLoading}
        data={chain(data).sortBy("agents").thru(sample(500)).value()}
        render={
          <SliceChart
            type="area"
            xAxisDataKey="agents"
            slice={slice ?? slices[0]}
            selected={selected}
            keyType="name"
          />
        }
      />
    </>
  );
}
