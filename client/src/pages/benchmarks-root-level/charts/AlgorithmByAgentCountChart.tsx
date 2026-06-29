import { Chart } from "components/analysis/Chart";
import ChartOptions, { stateOfTheArt } from "components/analysis/ChartOptions";
import { SliceChart } from "components/analysis/SliceChart";
import { Slice, useSliceSelector } from "components/analysis/useAlgorithmSelector";
import { formatLargeNumber } from "components/charts/CompletionByAlgorithmChart";
import { metrics } from "core/metrics";
import { chain, find, keyBy } from "lodash";
import { formatPercentage } from "utils/format";
import { useAlgorithmChartData } from "./useAlgorithmChartData";
import { useAlgorithmsData } from "queries/useAlgorithmQuery";
import { sample } from "components/charts/sample";

export const slices = [
  {
    key: "result",
    name: "Count",
    formatter: (v: string | number) => formatLargeNumber(+v),
  },
  {
    key: "proportion",
    name: "Proportion",
    formatter: (v: string | number) => formatPercentage(+v, 0),
  },
] satisfies Slice[];

export function AlgorithmByAgentCountChart({ algorithm }: { algorithm?: string }) {
  const { data: algorithms = [] } = useAlgorithmsData();

  const algorithmSelectorState = useSliceSelector(slices, undefined, algorithm ? [algorithm] : []);
  const { metric, slice, algorithms: selected } = algorithmSelectorState;
  const { data, isLoading } = useAlgorithmChartData(
    "agents",
    selected.length
      ? selected.filter((a) => a !== stateOfTheArt._id)
      : algorithms.map((c) => c._id),
    find(metrics, (m) => m.key === metric)?.keyAlt,
  );
  return (
    <>
      <ChartOptions {...algorithmSelectorState} stateOfTheArt slices={slices} slice={slice} />
      <Chart
        isLoading={isLoading}
        style={{ flex: 1 }}
        data={chain(data)
          .map((collection) => ({
            agentCount: +collection.id,
            ...keyBy(collection.data, "algorithm"),
          }))
          .sortBy("agentCount")
          .thru(sample(500))
          .value()}
        render={
          <SliceChart
            xAxisDataKey="agentCount"
            stacked={false}
            slice={slice ?? slices[0]}
            selected={selected}
            keyType="id"
            type="area"
            stateOfTheArt
          />
        }
      />
    </>
  );
}
