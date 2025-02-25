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

type AggregateQuery = {
  operation?: "count" | "sum" | "max" | "min" | "avg";
  value?: "solution_cost" | "lower_cost";
  map?: string;
  scenario?: string;
  agents?: number;
  filterBy?: "closed" | "solved" | "all";
  groupBy?: "scenario" | "map" | "agents";
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
