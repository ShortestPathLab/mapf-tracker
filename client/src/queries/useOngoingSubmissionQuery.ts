import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient as client } from "App";
import { useSnackbar } from "components/Snackbar";
import { APIConfig } from "core/config";
import { SummaryByApiKeyResult } from "core/types";
import { del, post } from "queries/mutation";
import { json } from "queries/query";

const REFETCH_MS = 1000;

export type ValidationOutcome = {
  isValidationRun: boolean;
  outcome: string;
  errors: string[];
};

export type OngoingSubmission = {
  id: string;
  createdAt: string;
  lowerBound: number;
  cost: number;
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

export function useOngoingSubmissionQuery(key?: string | number) {
  return useQuery({
    queryKey: [ONGOING_SUBMISSION_QUERY_KEY, key],
    queryFn: () =>
      json<OngoingSubmission[]>(
        `${APIConfig.apiUrl}/ongoing_submission/${key}`
      ),
    enabled: !!key,
    refetchInterval: REFETCH_MS,
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
export function useOngoingSubmissionSummaryQuery(key?: string | number) {
  return useQuery({
    queryKey: [ONGOING_SUBMISSION_QUERY_KEY, "summary", key],
    queryFn: () =>
      json<SummaryByApiKeyResult>(
        `${APIConfig.apiUrl}/ongoing_submission/summary/${key}`
      ),
    enabled: !!key,
    refetchInterval: REFETCH_MS,
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
      ...(await json<SubmissionTicket[]>(
        `${APIConfig.apiUrl}/ongoing_submission/status/${key}`
      )),
      ...Array.from(optimisticQueue),
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
