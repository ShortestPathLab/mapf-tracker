import { useTheme } from "@mui/material";
import { Chart } from "components/analysis/Chart";
import ChartOptions from "components/analysis/ChartOptions";
import {
  Slice,
  useAlgorithmSelector,
} from "components/analysis/useAlgorithmSelector";
import { capitalize, chain, filter, identity, keyBy, map } from "lodash";
import { useAlgorithmsData, useMapTypeData } from "queries/useAlgorithmQuery";
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Tooltip,
} from "recharts";
import { AxisDomain } from "recharts/types/util/types";
import { toneBy } from "utils/colors";
import { formatPercentage } from "utils/format";

export const slices = [
  {
    key: "count",
    name: "Proportion",
    formatter: formatPercentage,
    domain: [0, 1],
  },
  {
    key: "sum_value",
    name: "Count",
    formatter: identity,
    domain: [0, "auto"],
  },
] satisfies Slice[];

export function AlgorithmByMapTypeChart() {
  const { palette } = useTheme();
  const { data: algorithms = [] } = useAlgorithmsData();
  const algorithmSelectorState = useAlgorithmSelector(slices);
  const { metric, slice, selected } = algorithmSelectorState;
  const { data, isLoading } = useMapTypeData(metric);
  return (
    <>
      <ChartOptions {...algorithmSelectorState} slices={slices} />
      <Chart
        isLoading={isLoading}
        style={{ flex: 1 }}
        data={chain(data)
          .map((c) => ({
            map: capitalize(c.map_type),
            ...keyBy(c.results, "algo_name"),
          }))
          .sortBy("map")
          .value()}
        render={() => (
          <RadarChart>
            <Legend />
            <PolarRadiusAxis
              domain={slice.domain as AxisDomain}
              stroke={palette.text.primary}
            />
            <PolarAngleAxis dataKey="map" />
            {map(
              filter(
                algorithms,
                (a) => !selected.length || selected.includes(a._id)
              ),
              (algorithm, i) => (
                <Radar
                  fill={toneBy(palette.mode, i)}
                  isAnimationActive={false}
                  dataKey={`${algorithm.algo_name}.${slice.key}`}
                  opacity={0.6}
                  name={algorithm.algo_name}
                />
              )
            )}
            <PolarGrid stroke={palette.text.secondary} />
            <Tooltip
              cursor={{ fill: palette.action.disabledBackground }}
              formatter={slice.formatter}
            />
          </RadarChart>
        )}
      />
    </>
  );
}
