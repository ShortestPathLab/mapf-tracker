import { useQueries } from "@tanstack/react-query";
import { Chart } from "components/analysis/Chart";
import ChartOptions from "components/analysis/ChartOptions";
import { SliceChart } from "components/analysis/SliceChart";
import { Slice, useSliceSelector } from "components/analysis/useAlgorithmSelector";
import { Metric } from "core/metrics";
import { capitalize, fromPairs, keyBy, some, sortBy } from "lodash";
import { AggregateAlgorithmQuery, algorithmQuery } from "queries/useAggregateQuery";
import { useAlgorithmsData } from "queries/useAlgorithmQuery";
import { useScenariosByMap } from "queries/useMapQuery";

export const slices = [
  {
    key: "count",
    name: "Count",
  },
] satisfies Slice[];

// The legacy /algorithm/getScen*Info routes returned a server-side pivot
// (scenario × every algorithm). The canonical /queries/aggregate/algorithm
// endpoint returns one algorithm at a time, so we fan out one query per
// algorithm and re-assemble the pivot client-side. Scenario labels are
// resolved from the already-cached scenario metadata.
const metricToFilterBy: Record<Metric, AggregateAlgorithmQuery["filterBy"]> = {
  solved: "solved",
  solution: "best_solution",
  closed: "closed",
  lower: "best_lower",
};

export function AlgorithmByScenarioChart({ map }: { map: string }) {
  const algorithmSelectorState = useSliceSelector(slices);
  const { metric, slice, algorithms: selected } = algorithmSelectorState;
  const { data: algorithms = [], isLoading: isAlgorithmsLoading } = useAlgorithmsData();
  const { data: scenarios = [], isLoading: isScenariosLoading } = useScenariosByMap(map);
  const key = (slice ?? slices[0]).key;
  const { data, isLoading } = useQueries({
    queries: (map ? algorithms : []).map((a) =>
      algorithmQuery({
        algorithm: a._id,
        map,
        groupBy: "scenario",
        filterBy: metricToFilterBy[metric as Metric],
      }),
    ),
    combine: (results) => {
      const dictionaries = results.map((q) => keyBy(q.data, "_id"));
      const data = (scenarios as { id: string; scen_type: string; type_id: number }[])
        .filter((s) => some(algorithms, (_, i) => (dictionaries[i]?.[s.id]?.result ?? 0) > 0))
        .map((s) => ({
          name: capitalize(`${s.scen_type}-${s.type_id}`),
          ...fromPairs(
            algorithms.map((a, i) => [a._id, { [key]: dictionaries[i]?.[s.id]?.result ?? 0 }]),
          ),
        }));
      return {
        isLoading: isAlgorithmsLoading || isScenariosLoading || some(results, "isLoading"),
        data: sortBy(data, "name"),
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
