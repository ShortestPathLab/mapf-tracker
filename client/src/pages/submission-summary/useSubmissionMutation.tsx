import { useMutation } from "@tanstack/react-query";
import { queryClient } from "App";
import { APIConfig } from "core/config";
import { now } from "lodash";
import {
  ONGOING_SUBMISSION_QUERY_KEY,
  SubmissionTicket,
  optimisticQueue,
} from "queries/useOngoingSubmissionQuery";

export function useSubmissionMutation({
  apiKey,
}: {
  apiKey?: string | number;
}) {
  return useMutation({
    mutationFn: ({
      content,
      type,
      label,
    }: {
      label?: string;
      content: string;
      type: string;
      size?: number;
    }) =>
      fetch(
        `${APIConfig.apiUrl}/ongoing_submission/create/${apiKey}${
          label ? `/${encodeURIComponent(label)}` : ""
        }`,
        {
          method: "post",
          body: content,
          headers: { "Content-Type": type },
        }
      ),
    onMutate: async ({ label, size = 0 }) => {
      const optimistic = {
        label,
        status: "uploading",
        dateReceived: now(),
        size,
      } as SubmissionTicket;
      optimisticQueue.add(optimistic);
      queryClient.invalidateQueries({
        queryKey: [ONGOING_SUBMISSION_QUERY_KEY, "ticket", apiKey],
      });
      return { optimistic };
    },
    onSettled: async (res, _1, _2, { optimistic }) => {
      if (res.ok) {
        optimisticQueue.delete(optimistic);
      } else {
        optimistic.status = "error";
        optimistic.error = await res.json();
      }
      queryClient.invalidateQueries({
        queryKey: [ONGOING_SUBMISSION_QUERY_KEY, "ticket", apiKey],
      });
    },
    mutationKey: ["submission", apiKey],
  });
}
