import { useMutation } from "@tanstack/react-query";
import { map } from "lodash";
import {
  deleteAll,
  ongoingSubmissionScenarioQueryFn,
  useDeleteOngoingSubmissionMutation,
} from "queries/useOngoingSubmissionQuery";

export const useDeleteOngoingSubmissionByScenarioIndexMutation = (
  apiKey?: string | number
) => {
  const { mutateAsync: deleteEntry } =
    useDeleteOngoingSubmissionMutation(apiKey);
  return useMutation({
    mutationKey: ["deleteOngoingSubmission1"],
    mutationFn: async ({
      scenario,
      index,
    }: {
      scenario: string;
      index: number | typeof deleteAll;
    }) => {
      const sx = await ongoingSubmissionScenarioQueryFn(apiKey, scenario);
      return index === deleteAll
        ? await deleteEntry?.(map(sx, "id"))
        : await deleteEntry?.(sx?.[index]?.id);
    },
  });
};
