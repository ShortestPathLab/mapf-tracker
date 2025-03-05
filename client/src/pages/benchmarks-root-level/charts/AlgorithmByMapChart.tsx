import { Chart } from "components/analysis/Chart";
import ChartOptions, { stateOfTheArt } from "components/analysis/ChartOptions";
import { sliceBarChartRenderer } from "components/analysis/sliceBarChartRenderer";
import {
  Slice,
  useAlgorithmSelector,
} from "components/analysis/useAlgorithmSelector";
import { capitalize, chain, keyBy, map, max } from "lodash";
import { useMapData } from "queries/useAlgorithmQuery";

export const slices = [
  {
    key: "count",
    name: "Count",
  },
] satisfies Slice[];

export function AlgorithmByMapChart({ algorithm }: { algorithm?: string }) {
  const algorithmSelectorState = useAlgorithmSelector(
    slices,
    undefined,
    algorithm ? [stateOfTheArt._id, algorithm] : []
  );
  const { metric, slice, selected } = algorithmSelectorState;
  const { data, isLoading } = useMapData(metric);
  return (
    <>
      <ChartOptions {...algorithmSelectorState} slices={slices} stateOfTheArt />
      <Chart
        isLoading={isLoading}
        style={{ flex: 1 }}
        data={chain(data)
          .map((c) => ({
            ...c,
            solved_instances: [
              {
                ...stateOfTheArt,
                count: max(map(c.solved_instances, "count")),
              },
              ...c.solved_instances,
            ],
          }))
          .map((c) => ({
            map: capitalize(c.map_name),
            ...keyBy(c.solved_instances, "algo_name"),
          }))
          .sortBy("map")
          .value()}
        render={sliceBarChartRenderer({
          xAxisDataKey: "map",
          stacked: false,
          slice,
          selected,
          keyType: "name",
          stateOfTheArt: true,
        })}
      />
    </>
  );
}
