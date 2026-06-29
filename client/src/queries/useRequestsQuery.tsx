import { queryClient } from "App";
import api, { DataOf, useMutation, useQuery } from "hooks/useQuery";

export type ReviewOutcome = {
  status: "not-reviewed" | "approved" | "rejected";
  comments?: string;
};
// Inferred from the server, except `reviewStatus` which uses the client
// `ReviewOutcome` (the review forms produce it, with `comments` optional).
export type RequestWithReviewOutcome = Omit<
  DataOf<typeof api.api.request.basic.get>[number],
  "reviewStatus"
> & { reviewStatus: ReviewOutcome };

export function useRequestsQuery() {
  return useQuery(["requests"], api.api.request.get);
}

export const requestBasic = {
  useAll: () => useQuery(["request", "all"], api.api.request.basic.get),
  useOne: (id: string) =>
    useQuery(["request", "one", id], () => api.api.request.basic({ id }).get(), {
      enabled: !!id,
    }),
  useDelete: () =>
    useMutation((id: string) => api.api.request.basic.delete.post({ id }), {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["request"] }),
    }),
};

export function useRequestsUpdateMutation() {
  return useMutation(
    ({ id: key, value: values }: { id: string; value: Partial<RequestWithReviewOutcome> }) =>
      api.api.request.update({ id: key }).post(values),
    {
      mutationKey: ["requestsUpdate"],
      onSettled: () => queryClient.invalidateQueries({ queryKey: ["requests"] }),
    },
  );
}
export function useRequestsUpdateElevatedMutation() {
  return useMutation(
    ({ id: key, value: values }: { id: string; value: Partial<RequestWithReviewOutcome> }) =>
      api.api.request.updateElevated({ id: key }).post(values),
    {
      mutationKey: ["requestsUpdateElevated"],
      onSettled: () => queryClient.invalidateQueries({ queryKey: ["requests"] }),
    },
  );
}
export function useSendOutcomeMutation() {
  return useMutation((id: string) => api.api.user.notify.post({ requestId: id }), {
    mutationKey: ["requestsSendOutcome"],
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["requests"] }),
  });
}
