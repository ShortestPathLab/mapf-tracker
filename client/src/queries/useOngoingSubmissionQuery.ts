import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { queryClient as client } from "App";
import { Semaphore } from "async-mutex";
import { useSnackbar } from "components/Snackbar";
import { SummaryResult } from "core/types";
import {
  cloneDeep,
  head,
  keyBy,
  memoize,
  mergeWith,
  now,
  range,
  some,
  values,
} from "lodash";
import api, { DataOf, unwrap } from "hooks/useQuery";

const REFETCH_MS = 2500;

function mergeArray<T>(
  xs: T[],
  ys: T[],
  key: (t: T) => string,
  f: (a: T, b: T) => T,
) {
  return values(mergeWith(keyBy(xs, key), keyBy(ys, key), f));
}

function mergeValues(v1: unknown, v2: unknown): unknown {
  if (v1 instanceof Array && v2 instanceof Array) {
    return mergeArray<unknown>(
      v1,
      v2,
      (v) => (v as { id: string }).id,
      mergeValues,
    );
  }
  if (typeof v1 === "number" && typeof v2 === "number") {
    return v1 + v2;
  }
  return undefined;
}

// A scenario submission row (with the instance's best costs joined in),
// inferred from the `/ongoing_submission/scenario/:apiKey/:scenario` route.
export type OngoingSubmission = DataOf<
  ReturnType<ReturnType<typeof api.api.ongoing_submission.scenario>>["get"]
>[number];

export const ONGOING_SUBMISSION_QUERY_KEY = "ongoingSubmission";

export function useFinaliseOngoingSubmissionMutation(key: string | number) {
  const notify = useSnackbar();
  return useMutation({
    mutationKey: ["finaliseOngoingSubmission"],
    mutationFn: () =>
      unwrap(api.api.ongoing_submission.finalise({ key: `${key}` }).get()),
    onMutate: () => {
      client.cancelQueries({ queryKey: [ONGOING_SUBMISSION_QUERY_KEY, key] });
    },
    onSettled: async () => {
      notify("Submitted successfully");
      return await client.invalidateQueries({
        queryKey: [ONGOING_SUBMISSION_QUERY_KEY, key],
      });
    },
  });
}

const defaults = {
  running: 0,
  valid: 0,
  invalid: 0,
  outdated: 0,
};

export function useOngoingSubmissionCountQuery(key?: string | number) {
  return useQuery({
    queryKey: [ONGOING_SUBMISSION_QUERY_KEY, "general", key],
    queryFn: async () => ({
      ...defaults,
      ...(await unwrap(api.api.ongoing_submission({ apiKey: `${key}` }).get())),
    }),
    enabled: !!key,
    refetchInterval: REFETCH_MS,
    staleTime: 0,
    initialData: defaults,
  });
}

export function useOngoingSubmissionByIdQuery(id?: string | number) {
  return useQuery({
    queryKey: [ONGOING_SUBMISSION_QUERY_KEY, "id", id],
    queryFn: async () =>
      head(await unwrap(api.api.ongoing_submission.id({ id: `${id}` }).get())),
    enabled: !!id,
  });
}

export const ongoingSubmissionScenarioQueryFn = (
  key?: string | number,
  scenario?: string | number,
) =>
  unwrap(
    api.api.ongoing_submission
      .scenario({ apiKey: `${key}` })({ scenario: `${scenario}` })
      .get()
  );

export function useOngoingSubmissionScenarioQuery(
  key?: string | number,
  scenario?: string | number,
) {
  return useQuery({
    queryKey: [ONGOING_SUBMISSION_QUERY_KEY, key, scenario],
    queryFn: () => ongoingSubmissionScenarioQueryFn(key, scenario),
    enabled: !!key && !!scenario,
    refetchInterval: REFETCH_MS,
  });
}

const summaryPageCountQuery = (key?: string | number) => ({
  queryKey: [ONGOING_SUBMISSION_QUERY_KEY, "summary-pagecount", key],
  queryFn: () =>
    unwrap(
      api.api.ongoing_submission["summary-pagecount"]({
        apiKey: `${key}`,
      }).get()
    ),
  enabled: !!key,
  refetchInterval: REFETCH_MS,
  staleTime: 0,
  refetchOnReconnect: false,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
});

const MAX_TASKS = 4;
const mutexes = memoize((_: string | number) => new Semaphore(MAX_TASKS));

const summaryQuery = (key?: string | number, i: number = 0) => ({
  queryKey: [ONGOING_SUBMISSION_QUERY_KEY, "summary", key, i],
  queryFn: () =>
    // `key` is guaranteed present here since the query is only `enabled` when `key` is truthy
    mutexes(key!).runExclusive(
      async () =>
        (await unwrap(
          api.api.ongoing_submission
            .summary({ apiKey: `${key}` })({ page: `${i}` })
            .get()
        )) ?? null,
      // Each task has a weight of 1
      1,
      // FIFO
      -now(),
    ),
  enabled: !!key,
  staleTime: 0,
  refetchInterval: REFETCH_MS,
  refetchOnReconnect: false,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
});

export function useOngoingSubmissionSummaryQuery(key?: string | number) {
  const { data: pageCount = 0, isLoading: isLoadingPageCount } = useQuery(
    summaryPageCountQuery(key),
  );
  return useQueries({
    queries: range(pageCount).map((i) => summaryQuery(key, i)),
    combine: (results) => {
      const dataResults = results.map((r) => r.data);
      const lengths = dataResults.map((d) => d?.maps?.length ?? 0);
      return {
        data: {
          lengths,
          processed: mergeWith(
            {},
            ...dataResults,
            mergeValues,
          ) as SummaryResult,
        },
        isEmpty: lengths.every((l) => !l),
        isLoading: isLoadingPageCount || some(results, (r) => r.isLoading),
      };
    },
  });
}

export type SubmissionTicket = {
  label?: string;
  size?: number;
  error?: object;
  status: "uploading" | "unknown" | "done" | "pending" | "error";
  result?: { count: number };
  dateReceived: number;
};

export const optimisticQueue: Set<SubmissionTicket> = new Set();

export function useOngoingSubmissionTicketQuery(key?: string | number) {
  return useQuery({
    queryKey: [ONGOING_SUBMISSION_QUERY_KEY, "ticket", key],
    queryFn: async () => [
      ...await unwrap(api.api.ongoing_submission.status({ apiKey: `${key}` }).get()),
      ...cloneDeep(Array.from(optimisticQueue)),
    ],
    enabled: !!key,
    refetchInterval: REFETCH_MS,
  });
}

export const deleteAll = Symbol("Delete all entries");

export function useDeleteOngoingSubmissionMutation(key: string | number) {
  const notify = useSnackbar();
  return useMutation({
    mutationKey: ["deleteOngoingSubmission"],
    mutationFn: (k: string | string[] | typeof deleteAll) =>
      k === deleteAll
        ? unwrap(api.api.ongoing_submission({ apiKey: `${key}` }).delete())
        : unwrap(api.api.ongoing_submission.delete.post({ id: k })),
    onMutate: (k) => {
      client.cancelQueries({ queryKey: [ONGOING_SUBMISSION_QUERY_KEY, key] });
      client.setQueryData<OngoingSubmission[]>(
        [ONGOING_SUBMISSION_QUERY_KEY, key],
        (old) => old?.filter?.((x) => x.id !== k),
      );
    },
    onSettled: async () => {
      notify("Selection deleted");
      return await client.invalidateQueries({
        queryKey: [ONGOING_SUBMISSION_QUERY_KEY, key],
      });
    },
  });
}
