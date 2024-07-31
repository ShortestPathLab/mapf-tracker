import { toneBy } from "utils/colors";
import { map, filter } from "lodash";
import { BarChart, Legend, Tooltip, YAxis, XAxis, Bar } from "recharts";
import { AxisDomain } from "recharts/types/util/types";
import { Slice } from "./useAlgorithmSelector";

export function sliceBarChartRenderer({
  slice,
  algorithms,
  selected,
  mode,
  xAxisDataKey = "name",
}: {
  xAxisDataKey?: string;
  slice: Slice;
  algorithms: string[];
  selected: string[];
  mode: "light" | "dark";
}) {
  return () => (
    <BarChart>
      <Legend />
      <Tooltip formatter={slice.formatter} />
      <YAxis domain={slice.domain as AxisDomain} />
      <XAxis dataKey={xAxisDataKey} />
      {map(
        filter(algorithms, (a) => !selected.length || selected.includes(a)),
        (algorithm, i) => (
          <Bar
            fill={toneBy(mode, i)}
            isAnimationActive={false}
            dataKey={`${algorithm}.${slice.key}`}
            name={algorithm}
          />
        )
      )}
    </BarChart>
  );
}
