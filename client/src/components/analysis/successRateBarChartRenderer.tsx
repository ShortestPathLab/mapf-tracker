import { accentColors, tone } from "utils/colors";
import { map } from "lodash";
import { BarChart, Legend, XAxis, Tooltip, Bar } from "recharts";
import { formatPercentage } from "utils/format";

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
  return () => (
    <BarChart barCategoryGap={0}>
      <Legend />
      <Tooltip formatter={formatter} />
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
}
