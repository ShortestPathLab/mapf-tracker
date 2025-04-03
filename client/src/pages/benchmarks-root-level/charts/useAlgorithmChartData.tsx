import { useQueries } from "@tanstack/react-query";
import { stateOfTheArt } from "components/analysis/ChartOptions";
import { chain, keyBy, map, some, zip } from "lodash";
import {
  AggregateAlgorithmQuery,
  algorithmQuery,
  useAggregate,
} from "queries/useAggregateQuery";
import { useMemo } from "react";

export function useAlgorithmChartData(
  type: "map" | "mapType",
  algorithms: string[],
  metric: AggregateAlgorithmQuery["filterBy"]
) {
  const { data: qs, isLoading: qsLoading } = useQueries({
    queries: algorithms.map((a) =>
      algorithmQuery({
        algorithm: a,
        groupBy: type,
        filterBy: metric,
      })
    ),
    combine: (result) => ({
      isLoading: some(result, "isLoading"),
      data: zip(algorithms, map(result, "data")).map(([a, d]) => ({
        _id: a,
        data: d,
      })),
    }),
  });
  const { data: sota, isLoading: sotaLoading } = useAggregate({
    groupBy: type,
    filterBy: {
      best_lower: "closed" as const,
      best_solution: "solved" as const,
      closed: "closed" as const,
      solved: "solved" as const,
      all: "all" as const,
    }[metric],
  });
  const is = useMemo(() => keyBy(sota, "_id"), [sota]);
  const data = useMemo(
    () =>
      chain([{ ...stateOfTheArt, data: sota }, ...qs])
        .flatMap((d) =>
          map(d.data, (r) => ({
            algorithm: d._id,
            ...r,
          }))
        )
        .groupBy("_id")
        .toPairs()
        .map(([k, v]) => ({
          id: k,
          data: map(v, (r) => ({
            ...r,
            proportion: r.result / is[k]?.all || 0,
          })),
        }))
        .value(),
    [sota, qs, is]
  );
  return {
    isLoading: qsLoading || sotaLoading,
    data,
  };
}
