import { Instance } from "core/types";
import {
  SubmissionInfo,
  useAlgorithmScenarioQuery,
} from "queries/useAlgorithmQuery";
import { useInstance } from "queries/useInstanceQuery";
import { ReactNode } from "react";

export type SubmissionInstanceContextParams = {
  index?: number;
  scenario?: string;
  algorithm?: string;
};

export function SubmissionInstanceContext({
  index = 0,
  scenario,
  algorithm,
  children,
}: SubmissionInstanceContextParams & {
  children: (r: {
    isLoading?: boolean;
    current?: SubmissionInfo;
    instance?: Instance;
  }) => ReactNode;
}) {
  const { data, isLoading } = useAlgorithmScenarioQuery(algorithm, scenario);
  const current = data?.[index];
  const { data: instance, isLoading: isInstanceLoading } = useInstance(
    current?.instance_id
  );
  return children({
    current,
    instance,
    isLoading: isLoading || isInstanceLoading,
  });
}
