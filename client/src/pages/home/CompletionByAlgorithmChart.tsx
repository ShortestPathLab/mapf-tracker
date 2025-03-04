import { Box, alpha, useTheme } from "@mui/material";
import { Chart } from "components/analysis/Chart";
import { Slice } from "components/analysis/useAlgorithmSelector";
import {
  chain as _,
  find,
  floor,
  get,
  map,
  max,
  round,
  sortBy,
  zip,
} from "lodash";
import { useAggregateAlgorithm } from "queries/useAggregateQuery";
import { useAlgorithmsData } from "queries/useAlgorithmQuery";
import { ComponentProps, useMemo } from "react";
import { Bar, BarChart, Cell, Tooltip, XAxis, YAxis } from "recharts";
import { paper } from "theme";
import { toneBy } from "utils/colors";
import { GridChartCard } from "./GridChartCard";

export const slices = [
  {
    key: "count",
    name: "Count",
  },
] satisfies Slice[];

const sample =
  (n: number) =>
  <T,>(list: T[]) =>
    list.filter((_, i, xs) => i % (floor(xs.length / n) || 1) === 0);

const defaultSeries = [
  {
    opacity: 0.5,
    key: "closed",
    name: "Closed",
  },
  {
    opacity: 1,
    key: "solved",
    name: "Solved",
  },
];

export function CategoryChart({
  data,
  showLabels,
  series = defaultSeries,
  ...props
}: {
  showLabels?: boolean;
  series?: {
    opacity: number;
    key: string;
    name: string;
  }[];
  data?: { closed: number; solved: number; _id: string; i: number }[];
}) {
  const theme = useTheme();

  const peak = max(map(data, (c) => max(map(series, (s) => get(c, s.key)))));

  return (
    <BarChart
      data={data}
      margin={{ bottom: 20 }}
      layout="vertical"
      barGap={0}
      {...props}
    >
      <Tooltip
        formatter={(v, _, item) => (
          <Box
            component="span"
            sx={{
              color: toneBy(theme.palette.mode, item.payload.i),
            }}
          >
            {v}
          </Box>
        )}
        contentStyle={{ border: paper(0).border(theme) }}
        cursor={{ fill: theme.palette.action.disabledBackground }}
      />
      <YAxis
        type="category"
        orientation="right"
        tick={{ fill: theme.palette.text.secondary }}
        dataKey="label"
        width={120}
        mirror
      />
      <XAxis
        type="number"
        domain={[0, peak * 2]}
        tickFormatter={formatLargeNumber}
        label={{
          fill: theme.palette.text.secondary,
          value: "Instances solved",
          position: "insideBottom",
          offset: -8,
        }}
        width={50}
      />
      {map(series, ({ key, opacity, name }) => (
        <Bar
          type="monotone"
          isAnimationActive={false}
          dataKey={key}
          name={name}
          opacity={1}
          fill={theme.palette.text.secondary}
          fillOpacity={0}
          label={
            showLabels && {
              position: "right",
              fill: theme.palette.text.secondary,
              fontSize: 12,
              width: 1000,
              formatter: (v: number) => `${name}: ${formatLargeNumber(v)}`,
            }
          }
        >
          {data.map((entry, i) => (
            <Cell
              key={`${entry._id}-${i}`}
              fill={alpha(toneBy(theme.palette.mode, i), opacity)}
              fillOpacity={opacity}
            />
          ))}
        </Bar>
      ))}
    </BarChart>
  );
}

export function formatScientific(n: number) {
  return n > 9
    ? n.toLocaleString("fullwide", { notation: "scientific" })
    : `${n}`;
}

export function formatLargeNumber(n: number) {
  return n > 999 ? `${round(n / 1000, 1)}k` : `${n}`;
}

function CompletionByAlgorithmChart() {
  const { data: solved, isLoading: isSolvedLoading } = useAggregateAlgorithm({
    groupBy: "algorithm",
    filterBy: "solved",
  });
  const { data: closed, isLoading: isClosedLoading } = useAggregateAlgorithm({
    groupBy: "algorithm",
    filterBy: "closed",
  });
  const { data: algorithms, isLoading: isAlgorithmsLoading } =
    useAlgorithmsData();

  const { data } = useMemo(() => {
    const data = _(zip(sortBy(closed, "_id"), sortBy(solved, "_id")))
      .map(([c, s], i) => ({
        i,
        _id: c._id,
        label: find(algorithms, { _id: c._id })?.algo_name,
        all: c.all,
        solved: s.result,
        closed: c.result,
      }))
      .thru(sample(50))
      .value();
    return {
      data,
    };
  }, [closed, solved, algorithms]);
  return (
    <Chart
      isLoading={isSolvedLoading || isClosedLoading || isAlgorithmsLoading}
      style={{ flex: 1 }}
      data={data}
      render={() => <CategoryChart showLabels />}
    />
  );
}

export function CompletionByAlgorithmChartCard(
  props: ComponentProps<typeof GridChartCard>
) {
  return <GridChartCard {...props} content={<CompletionByAlgorithmChart />} />;
}
