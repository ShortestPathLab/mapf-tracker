import { useQuery } from "@tanstack/react-query";
import { APIConfig } from "core/config";
import hash from "object-hash";
import { json } from "./query";
import { head, mapValues, toString } from "lodash";

type Result = {
  _id: string | null;
  all: number;
  result: number;
};

export type AggregateQuery = {
  operation?: "count" | "sum" | "max" | "min" | "avg";
  value?: "solution_cost" | "lower_cost";
  map?: string;
  scenario?: string;
  scenarioType?: string;
  agents?: number;
  filterBy?: "closed" | "solved" | "all";
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
  const search = new URLSearchParams(mapValues(params, toString));
  return json<Result[]>(
    `${APIConfig.apiUrl}/queries/aggregate?${search.toString()}`
  );
}

export type AggregateAlgorithmQuery = Omit<
  AggregateQuery,
  "groupBy" | "filterBy"
> & {
  algorithm?: string;
  groupBy?: AggregateQuery["groupBy"] | "algorithm";
  filterBy?: AggregateQuery["filterBy"] | "best_lower" | "best_solution";
};

function aggregateAlgorithm(params: AggregateAlgorithmQuery) {
  const search = new URLSearchParams(mapValues(params, toString));
  return json<Result[]>(
    `${APIConfig.apiUrl}/queries/aggregate/algorithm?${search.toString()}`
  );
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
