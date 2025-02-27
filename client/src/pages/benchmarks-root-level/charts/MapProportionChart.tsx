import { alpha, useTheme } from "@mui/material";
import { Chart } from "components/analysis/Chart";
import {
  aggregateInstances,
  getInstanceAggregateProportions,
} from "components/analysis/reducers";
import { capitalize, chain, head, map } from "lodash";
import { useBenchmarksData } from "queries/useBenchmarksQuery";
import {
  Tooltip as ChartTooltip,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from "recharts";
import { accentColors, tone } from "utils/colors";
import { formatPercentage } from "utils/format";

export function MapProportionChart() {
  const { palette } = useTheme();
  const { data, isLoading } = useBenchmarksData();
  return (
    <Chart
      isLoading={isLoading}
      data={chain(data)
        .groupBy("map_type")
        .mapValues(aggregateInstances)
        .mapValues(getInstanceAggregateProportions)
        .mapValues((c) => ({ ...c, type: head(c.collection)?.map_type }))

        .entries()
        .map(([k, v]) => ({
          key: k,
          name: capitalize(k),
          ...v,
        }))
        .value()}
      render={() => (
        <RadarChart>
          <Legend />
          {map(
            [
              {
                color: alpha(tone(palette.mode, accentColors.deepPurple), 0.5),
                key: "proportionSolved",
                name: "Solved",
              },
              {
                color: tone(palette.mode, accentColors.deepPurple),
                key: "proportionClosed",
                name: "Closed",
              },
            ],
            ({ key, color, name }) => (
              <Radar
                fill={color}
                isAnimationActive={false}
                dataKey={key}
                opacity={0.8}
                name={name}
              />
            )
          )}
          <PolarGrid />
          <PolarRadiusAxis
            stroke={palette.text.primary}
            angle={90}
            tickFormatter={(v) => formatPercentage(v, 0)}
            domain={[0, 1]}
          />
          <PolarAngleAxis dataKey="name" />
          <ChartTooltip formatter={formatPercentage} />
        </RadarChart>
      )}
    />
  );
}
