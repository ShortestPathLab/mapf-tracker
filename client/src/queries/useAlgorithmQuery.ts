import { useQuery } from "@tanstack/react-query";
import { APIConfig } from "core/config";
import { Metric } from "core/metrics";
import {
  Algorithm,
  AlgorithmCollectionAggregate,
  AlgorithmCollectionCount,
  AlgorithmDetails,
  SummaryResult,
} from "core/types";
import { capitalize, find } from "lodash";
import { json } from "./query";

export function useAlgorithmSummaryQuery(algorithm?: string) {
  return useQuery(algorithmSummaryQuery(algorithm));
}

export type SubmissionInfo = {
  _id: string;
  agents: number;
  date: string;
  instance_id: string;
  lower_cost: number;
  solution_cost: number;
  best_lower: boolean;
  best_solution: boolean;
};

export function algorithmSummaryQuery(algorithm: string) {
  return {
    queryKey: ["algorithms", "summary", algorithm],
    queryFn: () =>
      json<SummaryResult>(
        `${APIConfig.apiUrl}/submission/summary/${algorithm}`
      ),
    enabled: !!algorithm,
  };
}

export function useAlgorithmScenarioQuery(
  algorithm?: string,
  scenario?: string
) {
  return useQuery(algorithmScenarioQuery(algorithm, scenario));
}

export const useAlgorithmsData = () => {
  return useQuery({
    queryKey: ["algorithms"],
    queryFn: () => json<Algorithm[]>(`${APIConfig.apiUrl}/algorithm/`),
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
    queryFn: () =>
      json<
        {
          id: string;
          lower_algos: (Algorithm & {
            value: number;
            algo_id: string;
            submission_id: string;
            date: string;
          })[];
          solution_algos: (Algorithm & {
            value: number;
            submission_id: string;
            algo_id: string;
            date: string;
          })[];
        }[]
      >(`${APIConfig.apiUrl}/instance/getAlgo/${id}`),
    enabled: !!id,
  });
};

export const useMapData = (query: Metric) =>
  useQuery({
    queryKey: ["mapData", query],
    queryFn: () =>
      json<
        {
          map_name: string;
          solved_instances: AlgorithmCollectionCount[];
        }[]
      >(`${APIConfig.apiUrl}/algorithm/get${capitalize(query)}Info`),
    enabled: !!query,
  });

export const useMapTypeData = (query: Metric) =>
  useQuery({
    queryKey: ["domainData", query],
    queryFn: () =>
      json<
        {
          map_type: string;
          results: AlgorithmCollectionAggregate[];
        }[]
      >(`${APIConfig.apiUrl}/algorithm/getDomain${capitalize(query)}Info`),
    enabled: !!query,
  });
export const useScenarioSuccessRateByAgentCountData = (id: string) =>
  useQuery({
    queryKey: ["scenarioSuccessRateByAgentCount", id],
    queryFn: () =>
      json<
        {
          Closed: number;
          Solved: number;
          Unknown: number;
          name: 1;
          total: 50;
        }[]
      >(`${APIConfig.apiUrl}/instance/test/${id}`),
    enabled: !!id,
  });
export function algorithmScenarioQuery(algorithm: string, scenario: string) {
  return {
    queryKey: ["algorithms", algorithm, scenario],
    queryFn: () =>
      json<SubmissionInfo[]>(
        `${APIConfig.apiUrl}/submission/${algorithm}/${scenario}`
      ),
    enabled: !!algorithm && !!scenario,
  };
}

export function algorithmDetailsQuery() {
  return {
    queryKey: ["algorithms-detailed"],
    queryFn: () =>
      json<AlgorithmDetails[]>(`${APIConfig.apiUrl}/algorithm/all_detail`),
  };
}
