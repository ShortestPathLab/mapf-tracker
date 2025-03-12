import { Chart } from "components/analysis/Chart";
import ChartOptions, { stateOfTheArt } from "components/analysis/ChartOptions";
import { SliceChart } from "components/analysis/SliceChart";
import {
  Slice,
  useAlgorithmSelector,
} from "components/analysis/useAlgorithmSelector";
import { capitalize, chain, includes, keyBy, map, maxBy } from "lodash";
import { useMapData } from "queries/useAlgorithmQuery";
import { useList } from "react-use";
import { formatPercentage } from "utils/format";
import { MapPicker } from "./MapPicker";

export const slices = [
  {
    key: "count",
    name: "Count",
  },
  {
    key: "proportion",
    name: "Proportion",
    formatter: (v) => formatPercentage(+v, 0),
  },
] satisfies Slice[];

export function AlgorithmByMapChart({ algorithm }: { algorithm?: string }) {
  const algorithmSelectorState = useAlgorithmSelector(
    slices,
    undefined,
    algorithm ? [stateOfTheArt._id, algorithm] : []
  );
  const [maps, { set: setMaps }] = useList<string>();
  const { metric, slice, selected } = algorithmSelectorState;
  const { data, isLoading } = useMapData(metric);
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
        isLoading={isLoading}
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
            map: capitalize(collection.map_name),
            ...keyBy(collection.solved_instances, "algo_name"),
          }))
          .sortBy("map")
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
