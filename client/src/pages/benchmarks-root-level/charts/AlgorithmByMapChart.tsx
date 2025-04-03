import { Chart } from "components/analysis/Chart";
import ChartOptions, { stateOfTheArt } from "components/analysis/ChartOptions";
import { SliceChart } from "components/analysis/SliceChart";
import {
  Slice,
  useSliceSelector,
} from "components/analysis/useAlgorithmSelector";
import { formatLargeNumber } from "components/charts/CompletionByAlgorithmChart";
import { metrics } from "core/metrics";
import { capitalize, chain, find, includes, keyBy } from "lodash";
import { useMapsData } from "queries/useMapQuery";
import { useList } from "react-use";
import { formatPercentage } from "utils/format";
import { MapPicker } from "./MapPicker";
import { useAlgorithmChartData } from "./useAlgorithmChartData";

export const slices = [
  {
    key: "result",
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
  const { data, isLoading } = useAlgorithmChartData(
    "map",
    selected.filter((a) => a !== stateOfTheArt._id),
    find(metrics, (m) => m.key === metric)?.keyAlt
  );
  const { data: mapInfo, isLoading: isInfoLoading } = useMapsData();
  console.log(data);
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
            maps.length ? includes(maps, collection.id) : true
          )
          .map((collection) => {
            const m = find(mapInfo, { map_name: collection.id });
            return {
              type: m?.map_type,
              map: capitalize(m?.map_name),
              ...keyBy(collection.data, "algorithm"),
            };
          })
          .sortBy("type")
          .value()}
        render={
          <SliceChart
            xAxisDataKey="map"
            stacked={false}
            slice={slice}
            selected={selected}
            keyType="id"
            stateOfTheArt
          />
        }
      />
    </>
  );
}
