import { useTheme } from "@mui/material";
import { Chart } from "components/analysis/Chart";
import ChartOptions, { stateOfTheArt } from "components/analysis/ChartOptions";
import {
  Slice,
  useSliceSelector,
} from "components/analysis/useAlgorithmSelector";
import { formatLargeNumber } from "components/charts/CompletionByAlgorithmChart";
import { metrics } from "core/metrics";
import { capitalize, chain, filter, find, keyBy, map } from "lodash";
import { useAlgorithmsData } from "queries/useAlgorithmQuery";
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
import { useAlgorithmChartData } from "./useAlgorithmChartData";

export const slices = [
  {
    key: "proportion",
    dataKey: "proportion",
    name: "Proportion",
    formatter: (v) => formatPercentage(+v, 0),
    domain: [0, 1],
  },
  {
    key: "proportion-extents",
    dataKey: "proportion",
    name: "Proportion (extents)",
    formatter: (v) => formatPercentage(+v, 0),
    domain: [0, "auto"],
  },
  {
    key: "count",
    dataKey: "result",
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
    algorithm ? [algorithm, stateOfTheArt._id] : []
  );
  const { metric, slice, algorithms: selected } = algorithmSelectorState;
  const { data, isLoading } = useAlgorithmChartData(
    "mapType",
    selected.filter((a) => a !== stateOfTheArt._id),
    find(metrics, (m) => m.key === metric)?.keyAlt
  );

  return (
    <>
      <ChartOptions {...algorithmSelectorState} slices={slices} stateOfTheArt />
      <Chart
        isLoading={isLoading}
        style={{ flex: 1 }}
        data={chain(data)
          .map((c) => ({
            domain: capitalize(c.id),
            ...keyBy(c.data, "algorithm"),
          }))
          .sortBy("map")
          .value()}
        render={
          <RadarChart>
            <Legend />
            <PolarAngleAxis dataKey="domain" />
            <PolarGrid stroke={palette.text.secondary} />
            {map(
              filter(
                [...algorithms, stateOfTheArt],
                (a) => !selected.length || selected.includes(a._id)
              ),
              (algorithm, i) => (
                <Radar
                  isAnimationActive={false}
                  dataKey={`${algorithm._id}.${slice.dataKey ?? slice.key}`}
                  opacity={0.5}
                  name={algorithm.algo_name}
                  {...(algorithm === stateOfTheArt
                    ? {
                        fill: palette.text.primary,
                        fillOpacity: 0,
                        stroke: palette.text.primary,
                        strokeOpacity: 1,
                        strokeWidth: 2,
                        opacity: 1,
                      }
                    : {
                        fill: toneBy(palette.mode, i),
                        fillOpacity: 0.4,
                      })}
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
