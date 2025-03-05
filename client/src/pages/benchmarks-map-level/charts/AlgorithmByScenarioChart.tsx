import { useQueries } from "@tanstack/react-query";
import { Chart } from "components/analysis/Chart";
import ChartOptions from "components/analysis/ChartOptions";
import {
  Slice,
  useAlgorithmSelector,
} from "components/analysis/useAlgorithmSelector";
import { BaseMetric } from "core/metrics";
import { flatMap, fromPairs, keys, map, startCase, uniq, zip } from "lodash";
import { CategoryChart } from "components/charts/CompletionByAlgorithmChart";
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

export const metrics = [
  { key: "closed", name: "Instances closed" },
  { key: "solved", name: "Instances solved" },
  { key: "best_lower", name: "Best lower-bound" },
  { key: "best_solution", name: "Best solution" },
] satisfies BaseMetric[];

export function AlgorithmByScenarioChart({ map: mapId }: { map: string }) {
  const algorithmSelectorState = useAlgorithmSelector(slices);
  const { metric, selected } = algorithmSelectorState;
  const { data: algorithms = [], isLoading: isAlgorithmsLoading } =
    useAlgorithmsData();

  const queries = useQueries({
    queries: algorithms.map(({ _id }) =>
      algorithmQuery({
        algorithm: _id,
        map: mapId,
        groupBy: "scenarioType",
        filterBy: metric as AggregateAlgorithmQuery["filterBy"],
      })
    ),
  });
  const isLoading = queries.some((q) => q.isLoading) || isAlgorithmsLoading;
  const data = zip(algorithms, queries)
    .map(([a, q]) => ({
      _id: a._id,
      label: a.algo_name,
      values: fromPairs(map(q.data, (v) => [v._id, v.result])),
    }))
    .filter(({ _id }) => (selected?.length ? selected.includes(_id) : true));
  const series = uniq(flatMap(data, (d) => keys(d.values))).map((id) => ({
    opacity: 1,
    key: `values.${id}`,
    name: startCase(id),
  }));
  return (
    <>
      <ChartOptions
        {...algorithmSelectorState}
        metrics={metrics}
        slices={slices}
      />
      <Chart
        isLoading={isLoading}
        style={{ flex: 1 }}
        data={data}
        render={() => <CategoryChart series={series} showLabels />}
      />
    </>
  );
}
