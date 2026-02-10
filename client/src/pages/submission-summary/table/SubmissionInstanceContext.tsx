import { SummarySlice } from "core/types";
import { filter, isUndefined } from "lodash";
import { useInstance } from "queries/useInstanceQuery";
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
  best: (s) =>
    s.validation.outcome === "valid" &&
    !isUndefined(s.cost) &&
    s.cost < (s.instance.solution_cost ?? Number.MAX_SAFE_INTEGER),
  tie: (s) =>
    s.validation.outcome === "valid" &&
    !isUndefined(s.cost) &&
    s.cost === (s.instance.solution_cost ?? Number.MAX_SAFE_INTEGER),
  dominated: (s) =>
    s.validation.outcome === "valid" &&
    !isUndefined(s.cost) &&
    s.cost > (s.instance.solution_cost ?? Number.MAX_SAFE_INTEGER),
  lb_tie: (s) =>
    s.validation.outcome === "valid" &&
    !isUndefined(s.instance.lower_cost) &&
    s.lowerBound === (s.instance.lower_cost ?? -1),
  lb_dominated: (s) =>
    s.validation.outcome === "valid" &&
    !isUndefined(s.lowerBound) &&
    s.lowerBound < (s.instance.lower_cost ?? -1),
  lb_best: (s) =>
    s.validation.outcome === "valid" &&
    !isUndefined(s.lowerBound) &&
    s.lowerBound > (s.instance.lower_cost ?? -1),
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
  const { data: instance, isLoading: isInstanceLoading } = useInstance(
    submission?.instance?._id,
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
