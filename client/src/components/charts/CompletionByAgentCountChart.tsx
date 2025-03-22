import { alpha, useTheme } from "@mui/material";
import { Chart } from "components/analysis/Chart";
import { Slice } from "components/analysis/useAlgorithmSelector";
import { chain as _, map, max, sortBy, zip } from "lodash";
import { AggregateQuery, useAggregate } from "queries/useAggregateQuery";
import { ComponentProps, useMemo } from "react";
import {
  Area,
  AreaChart,
  Label,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { paper } from "theme";
import { accentColors, tone } from "utils/colors";
import { formatPercentage } from "utils/format";
import { GridChartCard } from "./GridChartCard";
import { sample } from "./sample";

export const slices = [
  {
    key: "count",
    name: "Count",
  },
] satisfies Slice[];

function RenderChart({
  data,
  ...props
}: {
  data?: { all: number; closed: number; solved: number; _id: number }[];
}) {
  const theme = useTheme();
  const peak = max(map(data, (c) => c.all));
  const formatter = (n: number) => `${n} (${formatPercentage(n / peak)})`;

  return (
    <AreaChart data={data} margin={{ bottom: 20 }} {...props}>
      <Legend verticalAlign="top" />
      <Tooltip
        formatter={formatter}
        contentStyle={{ border: paper(0).border(theme) }}
        cursor={{ fill: theme.palette.action.disabledBackground }}
      />
      <XAxis
        type="number"
        tick={{ fill: theme.palette.text.secondary }}
        dataKey="_id"
        label={{
          fill: theme.palette.text.secondary,
          value: "Agent count",
          position: "insideBottom",
          offset: -8,
        }}
      />
      <YAxis
        scale="sqrt"
        tick={{ fill: theme.palette.text.secondary }}
        domain={[0, peak]}
        label={
          <Label
            fill={theme.palette.text.secondary}
            style={{ textAnchor: "middle" }}
            value="Instance count"
            angle={-90}
            position="insideLeft"
          />
        }
        width={50}
      />
      {map(
        [
          {
            color: tone(theme.palette.mode, accentColors.grey),
            key: "all",
            name: "Total instances",
            stroke: true,
          },
          {
            color: alpha(
              tone(theme.palette.mode, accentColors.lightBlue),
              0.25
            ),
            key: "solved",
            name: "Solved",
            stroke: false,
          },
          {
            color: tone(theme.palette.mode, accentColors.blue),
            key: "closed",
            name: "Closed",
            stroke: false,
          },
        ],
        ({ key, color, name, stroke }) => (
          <Area
            type="monotone"
            isAnimationActive={false}
            dataKey={key}
            name={name}
            opacity={0.8}
            fillOpacity={1}
            fill={stroke ? "transparent" : color}
            stroke={color}
          />
        )
      )}
    </AreaChart>
  );
}

export function CompletionByAgentCountChart({
  partialQuery,
}: {
  partialQuery?: AggregateQuery;
}) {
  const { data: solved, isLoading: isSolvedLoading } = useAggregate({
    ...partialQuery,
    groupBy: "agents",
    filterBy: "solved",
  });
  const { data: closed, isLoading: isClosedLoading } = useAggregate({
    ...partialQuery,
    groupBy: "agents",
    filterBy: "closed",
  });
  const { data } = useMemo(() => {
    const data = _(zip(sortBy(closed, "_id"), sortBy(solved, "_id")))
      .map(([c, s]) => ({
        _id: c?._id,
        all: c?.all,
        solved: s?.result,
        closed: c?.result,
      }))
      .thru(sample(250))
      .value();
    return {
      data,
    };
  }, [closed, solved]);
  return (
    <Chart
      isLoading={isSolvedLoading || isClosedLoading}
      style={{ flex: 1 }}
      data={data}
      render={<RenderChart />}
    />
  );
}

export function CompletionByAgentCountChartCard(
  props: ComponentProps<typeof GridChartCard>
) {
  return <GridChartCard {...props} content={<CompletionByAgentCountChart />} />;
}
