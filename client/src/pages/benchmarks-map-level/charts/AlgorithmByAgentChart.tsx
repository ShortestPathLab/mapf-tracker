import { Chart } from "components/analysis/Chart";
import ChartOptions from "components/analysis/ChartOptions";
import { SliceChart } from "components/analysis/SliceChart";
import {
  Slice,
  useSliceSelector,
} from "components/analysis/useAlgorithmSelector";
import { sample } from "components/charts/sample";
import { chain, keyBy } from "lodash";
import { useScenarioOnAgentData } from "queries/useScenarioQuery";

export const slices = [
  {
    key: "count",
    name: "Instance count",
  },
] satisfies Slice[];

export function AlgorithmByAgentChart({ map }: { map: string }) {
  const algorithmSelectorState = useSliceSelector(slices);
  const { metric, slice, algorithms: selected } = algorithmSelectorState;
  const { data, isLoading } = useScenarioOnAgentData(metric, map);
  return (
    <>
      <ChartOptions {...algorithmSelectorState} slices={slices} />
      <Chart
        isLoading={isLoading}
        style={{ flex: 1 }}
        data={chain(data)
          .map((c, i) => ({
            agentCount: i + 1,
            ...keyBy(c.solved_instances, "algo_name"),
          }))
          .thru(sample(250))
          .sortBy("agentCount")
          .value()}
        render={
          <SliceChart
            slice={slice}
            selected={selected}
            type="area"
            xAxisDataKey="agentCount"
            keyType="name"
          />
        }
      />
    </>
  );
}
