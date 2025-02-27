import { useTheme } from "@mui/material";
import { filter, map } from "lodash";
import { useAlgorithmsData } from "queries/useAlgorithmQuery";
import React from "react";
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
import { AxisDomain } from "recharts/types/util/types";
import { paper } from "theme";
import { toneBy } from "utils/colors";
import { Slice } from "./useAlgorithmSelector";

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
}: {
  xAxisDataKey?: string;
  keyType?: "id" | "name";
  slice: Slice;
  selected: string[];
  type?: "bar" | "area" | "line";
  stacked?: boolean;
}) {
  const { data: algorithms = [] } = useAlgorithmsData();
  const { chart: Chart, series: Series1 } = Charts[type];
  const Series = Series1 as unknown as React.FC<Record<string, unknown>>;
  return () => {
    const theme = useTheme();
    return (
      <Chart barCategoryGap={0}>
        <Legend />
        <Tooltip
          formatter={slice?.formatter}
          contentStyle={{ border: paper(0).border(theme) }}
          cursor={{ fill: theme.palette.action.disabledBackground }}
        />
        <YAxis domain={slice?.domain as AxisDomain} />
        <XAxis dataKey={xAxisDataKey} />
        {map(
          filter(
            algorithms,
            (a) => !selected.length || selected.includes(a._id)
          ),
          (algorithm, i) => (
            <Series
              fill={toneBy(theme.palette.mode, i)}
              isAnimationActive={false}
              dataKey={`${
                keyType === "name" ? algorithm.algo_name : algorithm._id
              }.${slice?.key}`}
              name={algorithm.algo_name}
              stroke={toneBy(theme.palette.mode, i)}
              opacity={0.5}
              stackId={stacked ? "1" : undefined}
            />
          )
        )}
      </Chart>
    );
  };
}
