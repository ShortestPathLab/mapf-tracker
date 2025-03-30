import { Stack, Typography, useTheme } from "@mui/material";
import { Chart } from "components/analysis/Chart";
import ChartOptions from "components/analysis/ChartOptions";
import {
  aggregateInstances,
  getInstanceAggregateProportions,
} from "components/analysis/reducers";
import {
  Slice,
  useSliceSelector,
} from "components/analysis/useAlgorithmSelector";
import { formatLargeNumber } from "components/charts/CompletionByAlgorithmChart";
import { DetailsList } from "components/DetailsList";
import { Scroll } from "components/dialog/Scrollbars";
import { capitalize, chain, head, map, startCase } from "lodash";
import { useMapsData } from "queries/useMapQuery";
import { useMeasure } from "react-use";
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
export const slices = [
  {
    key: "count",
    name: "Proportion",
    keySolved: "proportionSolved",
    keyClosed: "proportionClosed",
    keyAll: "proportionAll",
    formatter: (v: number) => formatPercentage(v, 0),
    domain: [0, 1],
    showAll: false,
  },
  {
    key: "sum_value",
    name: "Count",
    keySolved: "solved",
    keyClosed: "closed",
    keyAll: "instances",
    formatter: formatLargeNumber,
    domain: [0, "auto"],
    showAll: true,
  },
] satisfies (Slice & {
  keySolved: string;
  keyClosed: string;
  keyAll: string;
  showAll: boolean;
})[];

export function MapProportionChart() {
  const { palette } = useTheme();
  const { data, isLoading } = useMapsData();
  const selectorState = useSliceSelector(slices, undefined, []);
  const { slice } = selectorState;
  const aggregated = chain(data)
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
    .value();
  const [ref, { width }] = useMeasure();
  const showSummary = width > 430;
  return (
    <Stack sx={{ height: "100%", flex: 1 }} ref={ref}>
      <ChartOptions
        {...selectorState}
        slices={slices}
        disableAlgorithms
        disableMetrics
      />
      <Stack direction="row" sx={{ flex: 1, overflow: "hidden" }}>
        <Chart
          isLoading={isLoading}
          data={aggregated}
          render={
            <RadarChart>
              <Legend />
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              {map(
                [
                  {
                    color: tone(palette.mode, accentColors.green),
                    key: slice.keySolved,
                    name: "Solved",
                    stroke: undefined,
                  },
                  {
                    color: tone(palette.mode, accentColors.blue),
                    key: slice.keyClosed,
                    name: "Closed",
                    stroke: undefined,
                  },
                  {
                    key: slice.keyAll,
                    name: "All",
                    stroke: palette.text.primary,
                    color: undefined,
                  },
                ],
                ({ key, color, name, stroke }) => (
                  <Radar
                    fill={color ?? "transparent"}
                    isAnimationActive={false}
                    dataKey={key}
                    opacity={0.8}
                    fillOpacity={0.5}
                    name={name}
                    stroke={stroke}
                    strokeWidth={stroke ? 2 : 0}
                    strokeOpacity={stroke ? 1 : undefined}
                  />
                )
              )}
              <PolarRadiusAxis
                stroke={palette.text.primary}
                angle={70}
                tickFormatter={slice.formatter}
                domain={[0, 1]}
              />
              <ChartTooltip formatter={slice.formatter} />
            </RadarChart>
          }
        />
        {showSummary && (
          <Scroll
            y
            style={{
              maxWidth: "max-content",
            }}
          >
            <DetailsList
              sx={{
                "& .MuiListItem-root": {
                  textAlign: "right",
                },
              }}
              items={map(aggregated, (a) => ({
                label: startCase(a.type),
                value: (
                  <Typography variant="body2">
                    {`${slice.formatter(
                      a[slice.keySolved]
                    )} solved and ${slice.formatter(
                      a[slice.keyClosed]
                    )} closed${
                      slice.showAll
                        ? ` of ${slice.formatter(a[slice.keyAll])}`
                        : ""
                    }`}
                  </Typography>
                ),
              }))}
            />
          </Scroll>
        )}
      </Stack>
    </Stack>
  );
}
