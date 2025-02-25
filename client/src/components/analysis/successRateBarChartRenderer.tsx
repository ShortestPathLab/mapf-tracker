import { accentColors, tone } from "utils/colors";
import { map } from "lodash";
import { BarChart, Legend, XAxis, Tooltip, Bar } from "recharts";
import { formatPercentage } from "utils/format";
import { useTheme } from "@mui/material";
import { paper } from "theme";

export function successRateBarChartRenderer({
  mode,
  xAxisDataKey = "name",
  proportionClosedKey = "proportionClosed",
  proportionSolvedKey = "proportionSolved",
  formatter = formatPercentage,
}: {
  mode: "light" | "dark";
  xAxisDataKey?: string;
  proportionClosedKey?: string;
  proportionSolvedKey?: string;
  formatter?: (c: string | number) => string;
}) {
  return () => {
    const theme = useTheme();
    return (
      <BarChart barCategoryGap={0}>
        <Legend />
        <Tooltip
          formatter={formatter}
          contentStyle={{ border: paper(0).border(theme) }}
          cursor={{ fill: theme.palette.action.disabledBackground }}
        />
        <XAxis dataKey={xAxisDataKey} />
        {map(
          [
            {
              color: accentColors.green,
              key: proportionClosedKey,
              name: "Closed",
            },
            {
              color: accentColors.lime,
              key: proportionSolvedKey,
              name: "Solved",
            },
          ],
          ({ key, color, name }) => (
            <Bar
              isAnimationActive={false}
              dataKey={key}
              name={name}
              opacity={0.8}
              stackId="1"
              fill={tone(mode, color)}
            />
          )
        )}
      </BarChart>
    );
  };
}
