import {
  QueriesOptions,
  QueriesResults,
  useQueries,
} from "@tanstack/react-query";
import { identity } from "lodash";
import { useRef } from "react";
import { useInterval } from "react-use";

export const REFETCH_MS = 2000;

export const useRoundRobinQueries = <
  T extends Array<object>,
  TCombinedResult = QueriesResults<T>
>({
  queries,
  combine = identity,
}: {
  queries: [...QueriesOptions<T>];
  combine?: (result: QueriesResults<T>) => TCombinedResult;
}) => {
  const i = useRef(0);
  const { original, processed } = useQueries({
    queries: queries.map((query) => ({
      ...query,
      refetchOnWindowFocus: false,
      refetchInterval: false, // Disable automatic refetch
    })) as unknown as readonly [...QueriesOptions<T>],
    combine: (result) => ({
      original: result,
      processed: combine(result),
    }),
  });
  useInterval(() => {
    const elem = original[i.current % original.length];
    if (!elem.isFetching) {
      elem.refetch();
    }
    i.current++;
  }, REFETCH_MS);

  return processed;
};
