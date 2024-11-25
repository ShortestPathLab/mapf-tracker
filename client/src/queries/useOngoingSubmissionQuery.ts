import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient as client } from "App";
import { useSnackbar } from "components/Snackbar";
import { APIConfig } from "core/config";
import { del } from "queries/mutation";
import { json } from "queries/query";

const REFETCH_MS = 2000;

export type ValidationOutcome = {
  isValidationRun: boolean;
  outcome: string;
  errors: string[];
};

export type OngoingSubmission = {
  id: string;
  createdAt: string;
  lowerBound: string;
  cost: string;
  instance: string;
  apiKey: string;
  updatedAt: string;
  validation: ValidationOutcome;
};

const QUERY_KEY = "ongoingSubmission";

export function useFinaliseOngoingSubmissionMutation(key: string | number) {
  const notify = useSnackbar();
  return useMutation({
    mutationKey: ["finaliseOngoingSubmission"],
    mutationFn: () =>
      json(`${APIConfig.apiUrl}/ongoing_submission/finalise/${key}`),
    onMutate: (k) => {
      client.cancelQueries({ queryKey: [QUERY_KEY, key] });
    },
    onSettled: async () => {
      notify("Submitted successfully");
      return await client.invalidateQueries({
        queryKey: [QUERY_KEY, key],
      });
    },
  });
}

export function useOngoingSubmissionQuery(key?: string | number) {
  return useQuery({
    queryKey: [QUERY_KEY, key],
    queryFn: () =>
      json<OngoingSubmission[]>(
        `${APIConfig.apiUrl}/ongoing_submission/${key}`
      ),
    enabled: !!key,
    refetchInterval: REFETCH_MS,
  });
}

export function useDeleteOngoingSubmissionMutation(key: string | number) {
  const notify = useSnackbar();
  return useMutation({
    mutationKey: ["deleteOngoingSubmission"],
    mutationFn: (k: string) =>
      del(`${APIConfig.apiUrl}/ongoing_submission/id/${k}`),
    onMutate: (k) => {
      client.cancelQueries({ queryKey: [QUERY_KEY, key] });
      client.setQueryData<OngoingSubmission[]>([QUERY_KEY, key], (old) =>
        old.filter((x) => x.id !== k)
      );
    },
    onSettled: async () => {
      notify("Entry deleted");
      return await client.invalidateQueries({
        queryKey: [QUERY_KEY, key],
      });
    },
  });
}
