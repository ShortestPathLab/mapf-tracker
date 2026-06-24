import api, { unwrap } from "hooks/useQuery";
import { useQueries, useQuery } from "@tanstack/react-query";
import { map } from "lodash";

const instanceQuery = (id: string | number) => ({
  queryKey: ["instance", id],
  queryFn: () => unwrap(api.api.instance.id({ id: `${id}` }).get()),
  enabled: !!id,
});

export const useInstance = (id: number | string) => useQuery(instanceQuery(id));

export const useInstances = (ids: (number | string)[]) =>
  useQueries({
    queries: map(ids, instanceQuery),
  });
