import { useTheme } from "@mui/material";
import { map } from "lodash";
import { ComponentClass, createElement } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
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

export function successRateBarChartRenderer({
  xAxisDataKey = "name",
  proportionClosedKey = "proportionClosed",
  proportionSolvedKey = "proportionSolved",
  formatter = formatPercentage,
  type = "bar",
  yAxisDomain = [0, "auto"],
  stacked,
}: {
  stacked?: boolean;
  type?: "bar" | "area" | "line";
  mode?: "light" | "dark";
  xAxisDataKey?: string;
  yAxisDomain?: [number | "auto", number | "auto"];
  proportionClosedKey?: string;
  proportionSolvedKey?: string;
  formatter?: (c: string | number) => string;
}) {
  return () => {
    const theme = useTheme();
    const Charts = {
      bar: { chart: BarChart, series: Bar },
      line: { chart: LineChart, series: Line },
      area: { chart: AreaChart, series: Area },
    }[type];
    const { chart: Chart, series: Series } = Charts;

    return (
      <Chart>
        <Legend />
        <Tooltip
          formatter={formatter}
          contentStyle={{ border: paper(0).border(theme) }}
          cursor={{ fill: theme.palette.action.disabledBackground }}
        />
        <XAxis dataKey={xAxisDataKey} />
        <YAxis domain={yAxisDomain} />
        {map(
          [
            {
              color: accentColors.lime,
              key: proportionSolvedKey,
              name: "Solved",
            },
            {
              color: accentColors.green,
              key: proportionClosedKey,
              name: "Closed",
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
}
