import { useQuery } from "@tanstack/react-query";
import hash from "object-hash";
import { head } from "lodash";
import api, { unwrap } from "hooks/useQuery";

export type AggregateQuery = {
  operation?: "count" | "sum" | "max" | "min" | "avg";
  value?: "solution_cost" | "lower_cost" | "suboptimality";
  map?: string;
  scenario?: string;
  scenarioType?: string;
  agents?: number;
  filterBy?: "closed" | "solved" | "has_lower" | "all";
  groupBy?: "scenario" | "map" | "agents" | "scenarioType" | "mapType";
};

export const useAggregate = (params: AggregateQuery) => {
  return useQuery(aggregateQuery(params));
};

export const useAggregateOne = (params: AggregateQuery) => {
  return useQuery(aggregateQueryOne(params));
};

export function aggregateQuery(params: AggregateQuery) {
  return {
    queryKey: aggregateQueryKey(params),
    queryFn: () => aggregate(params),
  };
}

export function aggregateQueryOne(params: AggregateQuery) {
  return {
    queryKey: [...aggregateQueryKey(params), "one"],
    queryFn: async () => head(await aggregate(params)),
  };
}

function aggregateQueryKey(params: AggregateQuery): string[] {
  return ["queries/aggregate", hash(params)];
}

function aggregate(params: AggregateQuery) {
  return unwrap(api.api.queries.aggregate.get({ query: params }));
}

export type AggregateAlgorithmQuery = Omit<AggregateQuery, "groupBy" | "filterBy"> & {
  algorithm?: string;
  groupBy?: AggregateQuery["groupBy"] | "algorithm";
  filterBy?: AggregateQuery["filterBy"] | "best_lower" | "best_solution";
};

function aggregateAlgorithm(params: AggregateAlgorithmQuery) {
  return unwrap(api.api.queries.aggregate.algorithm.get({ query: params }));
}

export const useAggregateAlgorithm = (params: AggregateAlgorithmQuery) => {
  return useQuery(algorithmQuery(params));
};
export function algorithmQuery(params: AggregateAlgorithmQuery) {
  return {
    queryKey: ["queries/aggregate/algorithm", hash(params)],
    queryFn: () => aggregateAlgorithm(params),
  };
}
