import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient as client } from "App";
import { useSnackbar } from "components/Snackbar";
import { APIConfig } from "core/config";
import { SummaryResult } from "core/types";
import { cloneDeep, head, keyBy, map, mergeWith, values } from "lodash";
import { del, post } from "queries/mutation";
import { json } from "queries/query";
import { useRoundRobinQueries } from "../hooks/useRoundRobinQueries";

const REFETCH_MS = 5000;

function mergeArray<T>(
  xs: T[],
  ys: T[],
  key: (t: T) => string,
  f: (a: T, b: T) => T
) {
  return values(mergeWith(keyBy(xs, key), keyBy(ys, key), f));
}

function mergeValues(v1: unknown, v2: unknown) {
  if (v1 instanceof Array && v2 instanceof Array) {
    return mergeArray(v1, v2, (v) => v.id, mergeValues);
  }
  if (typeof v1 === "number" && typeof v2 === "number") {
    return v1 + v2;
  }
  return undefined;
}

export type ValidationOutcome = {
  isValidationRun: boolean;
  outcome: string;
  errors: { label: string; agents: number[]; timesteps: number[] }[];
  timeTaken?: number;
};

export type OngoingSubmission = {
  id: string;
  createdAt: string;
  lowerBound: number;
  cost?: number;
  instance: string;
  apiKey: string;
  updatedAt: string;
  validation: ValidationOutcome;
};

export const ONGOING_SUBMISSION_QUERY_KEY = "ongoingSubmission";

export function useFinaliseOngoingSubmissionMutation(key: string | number) {
  const notify = useSnackbar();
  return useMutation({
    mutationKey: ["finaliseOngoingSubmission"],
    mutationFn: () =>
      json(`${APIConfig.apiUrl}/ongoing_submission/finalise/${key}`),
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

export function useOngoingSubmissionCountQuery(key?: string | number) {
  return useQuery({
    queryKey: [ONGOING_SUBMISSION_QUERY_KEY, "general", key],
    queryFn: async () =>
      (
        await json<{ count: number }[]>(
          `${APIConfig.apiUrl}/ongoing_submission/${key}`
        )
      )[0],
    enabled: !!key,
    refetchInterval: REFETCH_MS,
  });
}

export function useOngoingSubmissionByIdQuery(id?: string | number) {
  return useQuery({
    queryKey: [ONGOING_SUBMISSION_QUERY_KEY, "id", id],
    queryFn: async () =>
      head(
        await json<OngoingSubmission[]>(
          `${APIConfig.apiUrl}/ongoing_submission/id/${id}`
        )
      ),
    enabled: !!id,
  });
}

export const ongoingSubmissionScenarioQueryFn = (
  key: string | number,
  scenario: string | number
) =>
  json<OngoingSubmission[]>(
    `${APIConfig.apiUrl}/ongoing_submission/scenario/${key}/${scenario}`
  );

export function useOngoingSubmissionScenarioQuery(
  key?: string | number,
  scenario?: string | number
) {
  return useQuery({
    queryKey: [ONGOING_SUBMISSION_QUERY_KEY, key, scenario],
    queryFn: () => ongoingSubmissionScenarioQueryFn(key, scenario),
    enabled: !!key && !!scenario,
    refetchInterval: REFETCH_MS,
  });
}

const summaryQuery = (key: string | number, i: number = 0) => ({
  queryKey: [ONGOING_SUBMISSION_QUERY_KEY, "summary", key, i],
  queryFn: () =>
    json<SummaryResult>(
      `${APIConfig.apiUrl}/ongoing_submission/summary/${key}/${i}`
    ),
  enabled: !!key,
  refetchInterval: false,
  refetchOnReconnect: false,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
});

export function useOngoingSubmissionSummaryQuery(key?: string | number) {
  return useRoundRobinQueries<
    SummaryResult,
    { lengths: number[]; processed: SummaryResult }
  >(
    `ongoing-submissions-${key}`,
    (i) => summaryQuery(key, i),
    (d) => d?.maps?.length ?? 0,
    (results) => {
      return {
        lengths: map(results, (d) => d?.maps?.length ?? 0),
        processed: mergeWith({}, ...results, mergeValues) as SummaryResult,
      };
    }
  );
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
      ...(await json<SubmissionTicket[]>(
        `${APIConfig.apiUrl}/ongoing_submission/status/${key}`
      )),
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
        ? del(`${APIConfig.apiUrl}/ongoing_submission/${key}`)
        : post(`${APIConfig.apiUrl}/ongoing_submission/delete`, { id: k }),
    onMutate: (k) => {
      client.cancelQueries({ queryKey: [ONGOING_SUBMISSION_QUERY_KEY, key] });
      client.setQueryData<OngoingSubmission[]>(
        [ONGOING_SUBMISSION_QUERY_KEY, key],
        (old) => old?.filter?.((x) => x.id !== k)
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
