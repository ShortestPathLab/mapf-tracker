import { alpha, Stack, useTheme } from "@mui/material";
import { useQueries } from "@tanstack/react-query";
import { Chart } from "components/analysis/Chart";
import { Bar } from "components/data-grid";
import { map } from "lodash";
import { aggregateQueryOne } from "queries/useAggregateQuery";
import { ComponentProps } from "react";
import {
  Cell,
  Label,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import { formatPercentage } from "utils/format";
import { GridChartCard } from "./GridChartCard";

export function TotalSolvedClosedChart(
  props: ComponentProps<typeof GridChartCard>
) {
  const theme = useTheme();
  const [
    { data: { result: closed = 0 } = {} },
    { data: { result: solved = 0, all: total = 1 } = {} },
  ] = useQueries({
    queries: [
      aggregateQueryOne({ filterBy: "closed" }),
      aggregateQueryOne({ filterBy: "solved" }),
    ],
  });
  return (
    <GridChartCard
      primaryLabel="Total completion"
      secondaryLabel={`${solved.toLocaleString()} solved / ${closed.toLocaleString()} closed / ${total.toLocaleString()} total`}
      {...props}
      content={
        <Bar
          sx={{ height: "100%" }}
          values={[
            { label: "Closed", value: closed / total, color: "success.main" },
            {
              label: "Solved but not closed",
              value: (solved - closed) / total,
              color: alpha(theme.palette.success.main, 0.35),
            },
          ]}
        />
      }
    />
  );
}
export function TotalSolvedClosedDonutChart(
  props: ComponentProps<typeof GridChartCard>
) {
  const theme = useTheme();
  const [
    { data: { result: closed = 0 } = {}, isLoading: isLoadingSolved },
    {
      data: { result: solved = 0, all: total = 1 } = {},
      isLoading: isLoadingClosed,
    },
  ] = useQueries({
    queries: [
      aggregateQueryOne({ filterBy: "closed" }),
      aggregateQueryOne({ filterBy: "solved" }),
    ],
  });
  return (
    <GridChartCard
      primaryLabel="Total completion"
      secondaryLabel={`${solved.toLocaleString()} solved / ${closed.toLocaleString()} closed / ${total.toLocaleString()} total`}
      {...props}
      content={
        <Stack
          direction="row"
          sx={{
            flex: 1,
            overflow: "hidden",
            "& > *": { maxWidth: 240, flex: 0 },
            justifyContent: "center",
          }}
        >
          <Chart
            isLoading={isLoadingClosed || isLoadingSolved}
            style={{ flex: 1 }}
            data={[
              {
                name: "Solved",
                value: solved / total,
                color: theme.palette.success.main,
              },
            ]}
            render={<DonutChart />}
          />
          <Chart
            style={{ flex: 1 }}
            isLoading={isLoadingClosed || isLoadingSolved}
            data={[
              {
                name: "Closed",
                value: closed / total,
                color: theme.palette.info.main,
              },
            ]}
            render={<DonutChart />}
          />
        </Stack>
      }
    />
  );
}

export function DonutChart({
  valueKey = "value",
  data,
  ...props
}: {
  valueKey?: string;
  data?: {
    name?: string;
    color?: string;
  }[];
}) {
  const theme = useTheme();
  return (
    <RadialBarChart
      startAngle={0}
      endAngle={360}
      data={data}
      innerRadius="70%"
      outerRadius="100%"
      {...props}
    >
      <PolarAngleAxis type="number" domain={[0, 1]} tick={false} />
      <PolarGrid gridType="circle" radialLines={false} stroke="none" />
      <RadialBar
        dataKey={valueKey}
        background={{
          fill: theme.palette.action.disabledBackground,
        }}
        cornerRadius={16}
      >
        {map(data, (d) => (
          <Cell fill={d.color || theme.palette.primary.main} />
        ))}
      </RadialBar>
      <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
        <Label
          content={({ viewBox }) => {
            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
              return (
                <text
                  x={viewBox.cx}
                  y={viewBox.cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  <tspan
                    fontSize={theme.typography.subtitle1.fontSize}
                    fill={theme.palette.text.primary}
                    x={viewBox.cx}
                    y={(viewBox.cy || 0) - 8}
                  >
                    {formatPercentage(data[0][valueKey], 0)}
                  </tspan>
                  <tspan
                    fill={theme.palette.text.secondary}
                    x={viewBox.cx}
                    y={(viewBox.cy || 0) + 16}
                  >
                    {data[0].name}
                  </tspan>
                </text>
              );
            }
          }}
        />
      </PolarRadiusAxis>
    </RadialBarChart>
  );
}
