import { useQuery } from "@tanstack/react-query";
import { APIConfig } from "core/config";
import { json } from "./query";
import { capitalize } from "lodash";
import {
  AlgorithmCollection,
  AlgorithmCollectionCount,
  AlgorithmCollectionAggregate,
} from "core/types";
import { Metric } from "core/metrics";

export const useAlgorithmsData = () => {
  return useQuery({
    queryKey: ["algorithms"],
    queryFn: () =>
      json<AlgorithmCollection[]>(`${APIConfig.apiUrl}/algorithm/`),
  });
};

export const useAlgorithmForInstanceData = (id: string) => {
  return useQuery({
    queryKey: ["algorithmInstance", id],
    queryFn: () =>
      json<
        {
          id: string;
          lower_algos: (AlgorithmCollection & {
            value: number;
            algo_id: string;
            submission_id: string;
            date: string;
          })[];
          solution_algos: (AlgorithmCollection & {
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
