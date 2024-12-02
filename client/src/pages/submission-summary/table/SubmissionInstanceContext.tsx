import { UseQueryResult, useQueries } from "@tanstack/react-query";
import { Instance, SummarySlice } from "core/types";
import { filter, map, some, zip } from "lodash";
import { useInstanceData, useInstancesData } from "queries/useInstanceQuery";
import {
  OngoingSubmission,
  useOngoingSubmissionScenarioQuery,
} from "queries/useOngoingSubmissionQuery";
import { ReactNode } from "react";

export type SubmissionInstanceProps = {
  apiKey?: string | number;
  scenarioId: string;
  index: number;
  slice?: keyof SummarySlice;
};

const filters: {
  [K in keyof SummarySlice]: (s: OngoingSubmission) => boolean;
} = {
  total: () => true,
  valid: (s) => s.validation.outcome === "valid",
  invalid: (s) => s.validation.outcome === "invalid",
  outdated: (s) => s.validation.outcome === "outdated",
  queued: () => false,
  best: (s) => s.validation.outcome === "valid",
  tie: () => false,
  dominated: () => false,
};

function useSubmissionInstance({
  apiKey,
  scenarioId,
  index,
  slice = "total",
}: SubmissionInstanceProps) {
  const { data: submissions, isLoading: isSubmissionLoading } =
    useOngoingSubmissionScenarioQuery(apiKey, scenarioId);
  const filtered = filter(submissions, filters[slice]);
  const submission = filtered?.[index];
  const { data: instance, isLoading: isInstanceLoading } = useInstanceData(
    submission?.instance
  );
  const isLoading = isSubmissionLoading || isInstanceLoading;
  return {
    isLoading,
    isSubmissionLoading,
    isInstanceLoading,
    submissions,
    instance,
    submission,
  };
}

export function SubmissionInstanceContext({
  apiKey,
  scenarioId,
  index,
  slice,
  render,
}: SubmissionInstanceProps & {
  render: (r: ReturnType<typeof useSubmissionInstance>) => ReactNode;
}) {
  const r = useSubmissionInstance({ apiKey, scenarioId, index, slice });
  return render(r);
}
