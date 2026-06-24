import { useQueries } from "@tanstack/react-query";
import { Chart } from "components/analysis/Chart";
import ChartOptions from "components/analysis/ChartOptions";
import { SliceChart } from "components/analysis/SliceChart";
import {
  Slice,
  useSliceSelector,
} from "components/analysis/useAlgorithmSelector";
import { Metric } from "core/metrics";
import { fromPairs, keyBy, max, range, some } from "lodash";
import {
  AggregateAlgorithmQuery,
  algorithmQuery,
} from "queries/useAggregateQuery";
import { useAlgorithmsData } from "queries/useAlgorithmQuery";

export const slices = [
  {
    key: "count",
    name: "Count",
  },
] satisfies Slice[];

// See AlgorithmByScenarioChart: the legacy /algorithm/getAgent*Info pivot is
// rebuilt client-side by fanning out one /queries/aggregate/algorithm call per
// algorithm and grouping by agent count.
const metricToFilterBy: Record<Metric, AggregateAlgorithmQuery["filterBy"]> = {
  solved: "solved",
  solution: "best_solution",
  closed: "closed",
  lower: "best_lower",
};

export function AlgorithmByAgentChart({ map }: { map: string }) {
  const algorithmSelectorState = useSliceSelector(slices);
  const { metric, slice, algorithms: selected } = algorithmSelectorState;
  const { data: algorithms = [], isLoading: isAlgorithmsLoading } =
    useAlgorithmsData();
  const key = (slice ?? slices[0]).key;
  const { data, isLoading } = useQueries({
    queries: (map ? algorithms : []).map((a) =>
      algorithmQuery({
        algorithm: a._id,
        map,
        groupBy: "agents",
        filterBy: metricToFilterBy[metric as Metric],
      })
    ),
    combine: (results) => {
      const dictionaries = results.map((q) => keyBy(q.data, "_id"));
      const maxAgents =
        max(
          results.flatMap((q) => (q.data ?? []).map((d) => +(d._id ?? 0)))
        ) ?? 0;
      const data = range(1, maxAgents + 1).map((agentCount) => ({
        name: agentCount,
        ...fromPairs(
          algorithms.map((a, i) => [
            a._id,
            { [key]: dictionaries[i]?.[agentCount]?.result },
          ])
        ),
      }));
      return {
        isLoading: isAlgorithmsLoading || some(results, "isLoading"),
        data,
      };
    },
  });
  return (
    <>
      <ChartOptions {...algorithmSelectorState} slices={slices} />
      <Chart
        isLoading={isLoading}
        style={{ flex: 1 }}
        data={data}
        render={<SliceChart slice={slice ?? slices[0]} selected={selected} />}
      />
    </>
  );
}
