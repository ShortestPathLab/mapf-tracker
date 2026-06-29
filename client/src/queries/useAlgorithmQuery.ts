import { useQuery } from "@tanstack/react-query";
import { find } from "lodash";
import api, { DataOf, unwrap } from "hooks/useQuery";

export function useAlgorithmSummaryQuery(algorithm?: string) {
  return useQuery(algorithmSummaryQuery(algorithm));
}

/** A submission row for an algorithm + scenario, inferred from the server. */
export type SubmissionInfo = DataOf<
  ReturnType<ReturnType<typeof api.api.submission>>["get"]
>[number];

export function algorithmSummaryQuery(algorithm?: string) {
  return {
    queryKey: ["algorithms", "summary", algorithm],
    queryFn: () => unwrap(api.api.submission.summary({ algorithm: `${algorithm}` }).get()),
    enabled: !!algorithm,
  };
}

export function useAlgorithmScenarioQuery(algorithm?: string, scenario?: string) {
  return useQuery(algorithmScenarioQuery(algorithm, scenario));
}

export const useAlgorithmsData = () => {
  return useQuery({
    queryKey: ["algorithms"],
    queryFn: () => unwrap(api.api.algorithm.get()),
  });
};

export const useAlgorithmDetailsData = () => {
  return useQuery(algorithmDetailsQuery());
};
export const useAlgorithmDetailData = (id?: string) => {
  const { data } = useAlgorithmDetailsData();
  return useQuery({
    queryKey: ["algorithms-detailed", id],
    queryFn: () => find(data, { _id: id }),
    enabled: !!id && !!data,
  });
};

export const useAlgorithmForInstanceData = (id: string) => {
  return useQuery({
    queryKey: ["algorithmInstance", id],
    queryFn: () => unwrap(api.api.instance.getAlgo({ id }).get()),
    enabled: !!id,
  });
};

export function algorithmScenarioQuery(algorithm?: string, scenario?: string) {
  return {
    queryKey: ["algorithms", algorithm, scenario],
    queryFn: () =>
      unwrap(
        api.api
          .submission({ algorithm: `${algorithm}` })({ scenario: `${scenario}` })
          .get(),
      ),
    enabled: !!algorithm && !!scenario,
  };
}

export function algorithmDetailsQuery() {
  return {
    queryKey: ["algorithms-detailed"],
    queryFn: () => unwrap(api.api.algorithm.all_detail.get()),
  };
}
