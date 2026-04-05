import { Chart } from "components/analysis/Chart";
import ChartOptions from "components/analysis/ChartOptions";
import { SliceChart } from "components/analysis/SliceChart";
import {
  Slice,
  useSliceSelector,
} from "components/analysis/useAlgorithmSelector";
import { sample } from "components/charts/sample";
import { BaseMetric } from "core/metrics";
import {
  chain,
  flatMap,
  fromPairs,
  keyBy,
  keys,
  map,
  max,
  range,
  startCase,
  uniq,
  zip,
} from "lodash";
import { useScenarioOnAgentData } from "queries/useScenarioQuery";
import {
  AggregateQuery,
  algorithmQuery,
  useAggregate,
  useAggregateAlgorithm,
} from "queries/useAggregateQuery";
import { useQueries } from "@tanstack/react-query";
import { useAlgorithmsData } from "queries/useAlgorithmQuery";

export const slices = [
  {
    key: "count",
    name: "Instance count",
  },
] as const satisfies Slice[];

export const metrics = [
  { key: "solved", name: "Instances solved" },
  { key: "closed", name: "Instances closed" },
  { key: "best_lower", name: "Best lower-bound" },
  { key: "best_solution", name: "Best solution" },
] as const satisfies BaseMetric[];

export function AlgorithmByAgentChart({ map: m }: { map: string }) {
  const algorithmSelectorState = useSliceSelector<
    (typeof metrics)[number],
    (typeof slices)[number]
  >(slices, metrics);
  const { metric, slice, algorithms: selected } = algorithmSelectorState;

  const { data: algorithms = [], isLoading: isAlgorithmsLoading } =
    useAlgorithmsData();

  const actualSelected = algorithms.filter(({ _id }) =>
    selected?.length ? selected.includes(_id) : true,
  );

  const { data, isLoading } = useQueries({
    queries: actualSelected.map((a) =>
      algorithmQuery({
        algorithm: a._id,
        map: m,
        groupBy: "agents",
        filterBy: metric,
      }),
    ),
    combine: (queries) => {
      const dictionaries = queries.map((q) => keyBy(q.data, "_id"));
      const maxA = max(queries.flatMap((q) => q.data?.map?.((d) => +d._id)));
      const data = range(1, maxA + 1).map((agentCount) => ({
        agentCount: agentCount,
        ...fromPairs(
          actualSelected.map((a, i) => [
            a._id,
            { [slice.key]: dictionaries[i][agentCount]?.result },
          ]),
        ),
      }));
      return {
        isLoading: queries.some((q) => q.isLoading) || isAlgorithmsLoading,
        data,
      };
    },
  });
  return (
    <>
      <ChartOptions
        {...algorithmSelectorState}
        slices={slices}
        metrics={metrics}
      />
      <Chart
        isLoading={isLoading}
        style={{ flex: 1 }}
        data={data}
        render={
          <SliceChart
            slice={slice}
            selected={selected}
            type="area"
            xAxisDataKey="agentCount"
            keyType="id"
          />
        }
      />
    </>
  );
}
