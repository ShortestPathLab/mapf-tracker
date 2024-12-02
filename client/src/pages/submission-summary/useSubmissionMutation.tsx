import { useMutation } from "@tanstack/react-query";
import { queryClient } from "App";
import { APIConfig } from "core/config";
import { now } from "lodash";
import { ONGOING_SUBMISSION_QUERY_KEY } from "queries/useOngoingSubmissionQuery";

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
      await queryClient.cancelQueries({
        queryKey: [ONGOING_SUBMISSION_QUERY_KEY, "ticket", apiKey],
      });

      const previousTickets = queryClient.getQueryData([
        ONGOING_SUBMISSION_QUERY_KEY,
        "ticket",
        apiKey,
      ]);

      queryClient.setQueryData(
        [ONGOING_SUBMISSION_QUERY_KEY, "ticket", apiKey],
        (old: any) => [
          ...(old || []),
          { label, status: "pending", dateReceived: now(), size },
        ]
      );
      return { previousTickets };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        [ONGOING_SUBMISSION_QUERY_KEY, "ticket", apiKey],
        context?.previousTickets
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ONGOING_SUBMISSION_QUERY_KEY, "ticket", apiKey],
      });
    },
    mutationKey: ["submission", apiKey],
  });
}
