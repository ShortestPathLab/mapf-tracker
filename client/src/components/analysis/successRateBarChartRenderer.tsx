import { useTheme } from "@mui/material";
import { map } from "lodash";
import { ComponentClass, createElement } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Label,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { paper } from "theme";
import { accentColors, tone } from "utils/colors";
import { formatPercentage } from "utils/format";

export const SuccessRateBarChart = ({
  xAxisDataKey = "name",
  proportionClosedKey = "proportionClosed",
  proportionSolvedKey = "proportionSolved",
  proportionUnknownKey = "proportionUnknown",
  formatter = formatPercentage,
  type = "bar",
  yAxisDomain = [0, "auto"],
  stacked,
  ...props
}: {
  stacked?: boolean;
  type?: "bar" | "area" | "line";
  mode?: "light" | "dark";
  xAxisDataKey?: string;
  yAxisDomain?: [number | "auto", number | "auto"];
  proportionClosedKey?: string;
  proportionUnknownKey?: string;
  proportionSolvedKey?: string;
  formatter?: (c: string | number) => string;
}) => {
  const theme = useTheme();
  const Charts = {
    bar: { chart: BarChart, series: Bar },
    line: { chart: LineChart, series: Line },
    area: { chart: AreaChart, series: Area },
  }[type];
  const { chart: Chart, series: Series } = Charts;

  return (
    <Chart margin={{ bottom: 20 }} barCategoryGap={0} {...props}>
      <Legend height={40} verticalAlign="top" />
      <Tooltip
        formatter={formatter}
        contentStyle={{ border: paper(0).border(theme) }}
        cursor={{ fill: theme.palette.action.disabledBackground }}
      />
      <XAxis
        dataKey={xAxisDataKey}
        angle={-45}
        textAnchor="end"
        height={140}
        label={{
          fill: theme.palette.text.secondary,
          value: "Map",
          position: "insideBottom",
          offset: -8,
        }}
      />
      <YAxis
        domain={yAxisDomain}
        label={
          <Label
            fill={theme.palette.text.secondary}
            style={{ textAnchor: "middle" }}
            value="Proportion"
            angle={-90}
            position="insideLeft"
          />
        }
      />
      {map(
        [
          {
            color: accentColors.green,
            key: proportionClosedKey,
            name: "Closed",
          },
          {
            color: accentColors.orange,
            key: proportionSolvedKey,
            name: "Solved",
          },
          {
            color: accentColors.red,
            key: proportionUnknownKey,
            name: "Open",
          },
        ],
        ({ key, color, name }) =>
          createElement(Series as ComponentClass<any, any>, {
            type: "monotone",
            isAnimationActive: false,
            dataKey: key,
            name,
            stackId: stacked ? "1" : undefined,
            opacity: 0.8,
            stroke: tone(theme.palette.mode, color),
            fill: tone(theme.palette.mode, color),
          })
      )}
    </Chart>
  );
};
