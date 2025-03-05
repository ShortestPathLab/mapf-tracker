import { useTheme } from "@mui/material";
import { filter, map } from "lodash";
import { useAlgorithmsData } from "queries/useAlgorithmQuery";
import React from "react";
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
import { AxisDomain } from "recharts/types/util/types";
import { paper } from "theme";
import { toneBy } from "utils/colors";
import { Slice } from "./useAlgorithmSelector";
import { stateOfTheArt } from "./ChartOptions";

const Charts = {
  bar: { chart: BarChart, series: Bar },
  line: { chart: LineChart, series: Line },
  area: { chart: AreaChart, series: Area },
};

export function sliceBarChartRenderer({
  slice,
  type = "bar",
  stacked,
  selected,
  xAxisDataKey = "name",
  keyType = "id",
  stateOfTheArt: stateOfTheArtEnabled,
}: {
  xAxisDataKey?: string;
  keyType?: "id" | "name";
  slice: Slice;
  selected: string[];
  type?: "bar" | "area" | "line";
  stacked?: boolean;
  stateOfTheArt?: boolean;
}) {
  const { data: algorithms = [] } = useAlgorithmsData();
  const algorithms1 = stateOfTheArtEnabled
    ? [stateOfTheArt, ...algorithms]
    : algorithms;
  const { chart: Chart, series: Series1 } = Charts[type];
  const Series = Series1 as unknown as React.FC<Record<string, unknown>>;
  return () => {
    const theme = useTheme();
    return (
      <Chart barCategoryGap={4} barGap={0}>
        <Legend />
        <Tooltip
          formatter={slice?.formatter}
          contentStyle={{ border: paper(0).border(theme) }}
          cursor={{ fill: theme.palette.action.disabledBackground }}
        />
        <YAxis
          domain={slice?.domain as AxisDomain}
          label={
            <Label
              position="insideLeft"
              value="Instance count"
              angle={-90}
              style={{ textAnchor: "middle" }}
            />
          }
        />
        <XAxis
          dataKey={xAxisDataKey}
          type="category"
          angle={-45}
          textAnchor="end"
          height={140}
        />
        {map(
          filter(
            algorithms1,
            (a) => !selected.length || selected.includes(a._id)
          ),
          (algorithm, i) => (
            <Series
              {...(algorithm === stateOfTheArt
                ? {
                    fill: theme.palette.primary.main,
                    fillOpacity: 0.1,
                    stroke: theme.palette.primary.main,
                  }
                : {
                    fill: toneBy(theme.palette.mode, i),
                    stroke: toneBy(theme.palette.mode, i),
                  })}
              isAnimationActive={false}
              dataKey={`${
                keyType === "name" ? algorithm.algo_name : algorithm._id
              }.${slice?.key}`}
              name={algorithm.algo_name}
              stackId={stacked ? "1" : undefined}
            />
          )
        )}
      </Chart>
    );
  };
}
