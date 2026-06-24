import { useMutation } from "@tanstack/react-query";
import { queryClient } from "App";
import { APIConfig } from "core/config";
import { now } from "lodash";
import { getAuth } from "queries/mutation";
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
    mutationFn: async ({
      content,
      type,
      label,
    }: {
      label?: string;
      content: string;
      type?: string;
      size?: number;
    }) => {
      // Raw fetch (not Eden): the body is the raw submission text sent with a
      // caller-provided content type, which the server parses by content type.
      const res = await fetch(
        `${APIConfig.apiUrl}/ongoing_submission/create/${apiKey}${
          label ? `/${encodeURIComponent(label)}` : ""
        }`,
        {
          method: "post",
          headers: { "Content-Type": type ?? "application/json", ...getAuth() },
          body: `${content}`,
        },
      );
      if (!res.ok) {
        throw (await res.json().catch(() => null)) ?? new Error(res.statusText);
      }
      return res;
    },
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
    onSettled: async (res, e, _2, context) => {
      const optimistic = context?.optimistic;
      if (optimistic) {
        if (res?.ok) {
          optimisticQueue.delete(optimistic);
        } else {
          optimistic.status = "error";
          optimistic.error = e ?? (await res?.json?.());
        }
      }
      queryClient.invalidateQueries({
        queryKey: [ONGOING_SUBMISSION_QUERY_KEY, "ticket", apiKey],
      });
    },
    mutationKey: ["submission", apiKey],
  });
}
