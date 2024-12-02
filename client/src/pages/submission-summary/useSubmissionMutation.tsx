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
      } satisfies SubmissionTicket;
      optimisticQueue.add(optimistic);
      return { optimistic };
    },
    onSettled: (_0, _1, _2, { optimistic }) => {
      optimisticQueue.delete(optimistic);
    },
    mutationKey: ["submission", apiKey],
  });
}
