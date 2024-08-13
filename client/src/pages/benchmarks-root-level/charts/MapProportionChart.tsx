import { useTheme } from "@mui/material";
import { accentColors, tone } from "utils/colors";
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
import { Chart } from "components/analysis/Chart";
import { formatPercentage } from "utils/format";
import {
  aggregateInstances,
  getInstanceAggregateProportions,
} from "components/analysis/reducers";

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
                color: accentColors.lime,
                key: "proportionSolved",
                name: "Solved",
              },
              {
                color: accentColors.green,
                key: "proportionClosed",
                name: "Closed",
              },
            ],
            ({ key, color, name }) => (
              <Radar
                fill={tone(palette.mode, color)}
                isAnimationActive={false}
                dataKey={key}
                opacity={0.8}
                name={name}
              />
            )
          )}
          <PolarGrid />
          <PolarRadiusAxis stroke={palette.text.primary} domain={[0, 1]} />
          <PolarAngleAxis dataKey="name" />
          <ChartTooltip formatter={formatPercentage} />
        </RadarChart>
      )}
    />
  );
}
