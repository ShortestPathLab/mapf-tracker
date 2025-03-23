import { Chart } from "components/analysis/Chart";
import ChartOptions, { stateOfTheArt } from "components/analysis/ChartOptions";
import { SliceChart } from "components/analysis/SliceChart";
import {
  Slice,
  useSliceSelector,
} from "components/analysis/useAlgorithmSelector";
import { capitalize, chain, find, includes, keyBy, map, maxBy } from "lodash";
import { useMapData } from "queries/useAlgorithmQuery";
import { useBenchmarksData } from "queries/useBenchmarksQuery";
import { useList } from "react-use";
import { formatPercentage } from "utils/format";
import { MapPicker } from "./MapPicker";
import { formatLargeNumber } from "components/charts/CompletionByAlgorithmChart";

export const slices = [
  {
    key: "count",
    name: "Count",
    formatter: formatLargeNumber,
  },
  {
    key: "proportion",
    name: "Proportion",
    formatter: (v) => formatPercentage(+v, 0),
  },
] satisfies Slice[];

export function AlgorithmByMapChart({ algorithm }: { algorithm?: string }) {
  const algorithmSelectorState = useSliceSelector(
    slices,
    undefined,
    algorithm ? [stateOfTheArt._id, algorithm] : []
  );
  const [maps, { set: setMaps }] = useList<string>();
  const { metric, slice, algorithms: selected } = algorithmSelectorState;
  const { data, isLoading } = useMapData(metric);
  const { data: mapInfo, isLoading: isInfoLoading } = useBenchmarksData();
  return (
    <>
      <ChartOptions
        {...algorithmSelectorState}
        stateOfTheArt
        slices={slices}
        slice={slice}
        extras={
          <MapPicker
            disabled={isLoading}
            value={maps}
            onChange={(e) => setMaps(e.target.value as unknown as string[])}
          />
        }
      />
      <Chart
        isLoading={isLoading || isInfoLoading}
        style={{ flex: 1 }}
        data={chain(data)
          .filter((collection) =>
            maps.length ? includes(maps, collection.map_name) : true
          )
          .map((collection) => ({
            ...collection,
            solved_instances: map(
              // Add state of the art
              [
                {
                  ...maxBy(collection.solved_instances, "count"),
                  ...stateOfTheArt,
                },
                ...collection.solved_instances,
              ],
              // Add proportion
              (instance) => ({
                ...instance,
                proportion: instance.count / instance.total,
              })
            ),
          }))
          .map((collection) => ({
            type: find(mapInfo, { map_name: collection.map_name })?.map_type,
            map: capitalize(collection.map_name),
            ...keyBy(collection.solved_instances, "algo_name"),
          }))
          .sortBy("type")
          .value()}
        render={
          <SliceChart
            xAxisDataKey="map"
            stacked={false}
            slice={slice}
            selected={selected}
            keyType="name"
            stateOfTheArt={true}
          />
        }
      />
    </>
  );
}
