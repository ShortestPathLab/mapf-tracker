import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "App";
import { APIConfig } from "core/config";
import { post } from "queries/mutation";
import { json, useBasic } from "queries/query";
import { Request } from "queries/useRequestQuery";

export type ReviewOutcome = {
  status: "not-reviewed" | "approved" | "rejected";
  comments?: string;
};
export type RequestWithReviewOutcome = {
  id: string;
  reviewStatus: ReviewOutcome;
} & Request;
export function useRequestsQuery() {
  return useQuery({
    queryKey: ["requests"],
    queryFn: () =>
      json<RequestWithReviewOutcome[]>(`${APIConfig.apiUrl}/request`),
  });
}

export const requestBasic = useBasic<RequestWithReviewOutcome>(
  `${APIConfig.apiUrl}/request/basic`
);

export function useRequestsUpdateMutation() {
  return useMutation({
    mutationKey: ["requestsUpdate"],
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["requests"] }),
    mutationFn: ({
      id: key,
      value: values,
    }: {
      id: string;
      value: Partial<RequestWithReviewOutcome>;
    }) => post(`${APIConfig.apiUrl}/request/update/${key}`, values),
  });
}
export function useRequestsUpdateElevatedMutation() {
  return useMutation({
    mutationKey: ["requestsUpdateElevated"],
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["requests"] }),
    mutationFn: ({
      id: key,
      value: values,
    }: {
      id: string;
      value: Partial<RequestWithReviewOutcome>;
    }) => post(`${APIConfig.apiUrl}/request/updateElevated/${key}`, values),
  });
}
export function useSendOutcomeMutation() {
  return useMutation({
    mutationKey: ["requestsSendOutcome"],
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["requests"] }),
    mutationFn: (id: string) =>
      post(`${APIConfig.apiUrl}/user/notify`, { requestId: id }),
  });
}
