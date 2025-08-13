import { useTheme } from "@mui/material";
import { Chart } from "components/analysis/Chart";
import { sample } from "components/charts/sample";
import { chain as _, map, sortBy, zip } from "lodash";
import pluralize from "pluralize";
import { useAggregate } from "queries/useAggregateQuery";
import { useMemo } from "react";
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

function RenderChart({
  data,
  ...props
}: {
  data?: { solutionCost: number; lowerCost: number; _id: number }[];
}) {
  const theme = useTheme();

  return (
    <AreaChart data={data} margin={{ bottom: 20 }} {...props}>
      <Legend verticalAlign="top" />
      <Tooltip
        labelFormatter={(c) => pluralize("Agent", +c, true)}
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
        tick={{ fill: theme.palette.text.secondary }}
        label={
          <Label
            fill={theme.palette.text.secondary}
            style={{ textAnchor: "middle" }}
            value="Cost"
            angle={-90}
            position="insideLeft"
          />
        }
        width={100}
      />
      {map(
        [
          {
            color: tone(theme.palette.mode, accentColors.indigo),
            key: "solutionCost",
            name: "Solution cost",
            stroke: false,
          },
          {
            color: tone(theme.palette.mode, accentColors.purple),
            key: "lowerCost",
            name: "Lower-bound cost",
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
            fillOpacity={0.5}
            fill={stroke ? "transparent" : color}
            stroke={color}
            strokeWidth={stroke ? 2 : 0}
            strokeOpacity={1}
          />
        )
      )}
    </AreaChart>
  );
}

export function CostChart({ scenario }: { scenario: string }) {
  const { data: solutionCosts, isLoading: solutionCostsLoading } = useAggregate(
    {
      scenario,
      groupBy: "agents",
      value: "solution_cost",
      operation: "max",
    }
  );
  const { data: lowerCosts, isLoading: lowerCostsLoading } = useAggregate({
    scenario,
    groupBy: "agents",
    value: "lower_cost",
    operation: "max",
  });
  const { data } = useMemo(() => {
    const data = _(zip(sortBy(solutionCosts, "_id"), sortBy(lowerCosts, "_id")))
      .map(([c, s]) => ({
        _id: c?._id,
        solutionCost: s?.result,
        lowerCost: c?.result,
      }))
      .thru(sample(250))
      .value();
    return {
      data,
    };
  }, [solutionCosts, lowerCosts]);
  return (
    <Chart
      isLoading={solutionCostsLoading || lowerCostsLoading}
      style={{ flex: 1 }}
      data={data}
      render={<RenderChart />}
    />
  );
}
