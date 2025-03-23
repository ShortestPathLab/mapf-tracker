import { useTheme } from "@mui/material";
import { Chart } from "components/analysis/Chart";
import ChartOptions, { stateOfTheArt } from "components/analysis/ChartOptions";
import {
  Slice,
  useSliceSelector,
} from "components/analysis/useAlgorithmSelector";
import { formatLargeNumber } from "components/charts/CompletionByAlgorithmChart";
import { capitalize, chain, filter, keyBy, map, max } from "lodash";
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
    formatter: (v) => formatPercentage(+v, 0),
    domain: [0, 1],
  },
  {
    key: "sum_value",
    name: "Count",
    formatter: formatLargeNumber,
    domain: [0, "auto"],
  },
] satisfies Slice[];

export function AlgorithmByMapTypeChart({ algorithm }: { algorithm?: string }) {
  const { palette } = useTheme();
  const { data: algorithms = [] } = useAlgorithmsData();
  const algorithmSelectorState = useSliceSelector(
    slices,
    undefined,
    algorithm ? [stateOfTheArt._id, algorithm] : []
  );
  const { metric, slice, algorithms: selected } = algorithmSelectorState;
  const { data, isLoading } = useMapTypeData(metric);

  return (
    <>
      <ChartOptions {...algorithmSelectorState} slices={slices} stateOfTheArt />
      <Chart
        isLoading={isLoading}
        style={{ flex: 1 }}
        data={chain(data)
          .map((c) => ({
            map_type: c.map_type,
            results: [
              ...c.results,
              {
                ...stateOfTheArt,
                count: max(map(c.results, "count")),
              },
            ],
          }))
          .map((c) => ({
            map: capitalize(c.map_type),
            ...keyBy(c.results, "algo_name"),
          }))
          .sortBy("map")
          .value()}
        render={
          <RadarChart>
            <Legend />
            <PolarAngleAxis dataKey="map" />
            <PolarGrid stroke={palette.text.secondary} />
            {map(
              filter(
                [stateOfTheArt, ...algorithms],
                (a) => !selected.length || selected.includes(a._id)
              ),
              (algorithm, i) => (
                <Radar
                  {...(algorithm === stateOfTheArt
                    ? {
                        fill: palette.info.main,
                        fillOpacity: 0,
                        stroke: palette.info.main,
                        strokeOpacity: 1,
                        strokeWidth: 1.5,
                      }
                    : {
                        fill: toneBy(palette.mode, i),
                        fillOpacity: 0.4,
                      })}
                  isAnimationActive={false}
                  dataKey={`${algorithm.algo_name}.${slice.key}`}
                  opacity={1}
                  name={algorithm.algo_name}
                />
              )
            )}
            <PolarRadiusAxis
              domain={slice.domain as AxisDomain}
              stroke={palette.text.primary}
              tickFormatter={(v) => slice.formatter(v)}
            />
            <Tooltip
              cursor={{ fill: palette.action.disabledBackground }}
              formatter={slice.formatter}
            />
          </RadarChart>
        }
      />
    </>
  );
}
