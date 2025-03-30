import { APIConfig } from "core/config";
import { Instance } from "core/types";
import { json } from "./query";
import { useQueries, useQuery } from "@tanstack/react-query";
import { map } from "lodash";

const queryFn = (id: string | number) => () =>
  json<Instance>(`${APIConfig.apiUrl}/instance/id/${id}`);

const instanceQuery = (id: string | number) => ({
  queryKey: ["instance", id],
  queryFn: queryFn(id),
  enabled: !!id,
});

export const useInstance = (id: number | string) => useQuery(instanceQuery(id));

export const useInstances = (ids: (number | string)[]) =>
  useQueries({
    queries: map(ids, instanceQuery),
  });
