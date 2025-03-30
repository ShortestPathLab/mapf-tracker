import { useQuery } from "@tanstack/react-query";
import { APIConfig } from "core/config";
import { capitalize, upperFirst } from "lodash";
import { Algorithm, AlgorithmCollectionCount } from "core/types";
import { Metric, ScenarioMetric } from "core/metrics";
import { json } from "./query";

export const useScenarioData = (query: Metric, id: string) =>
  useQuery({
    queryKey: ["scenarioData", query, id],
    queryFn: () =>
      json<
        {
          scen_type: string;
          type_id: number;
          solved_instances: AlgorithmCollectionCount[];
        }[]
      >(`${APIConfig.apiUrl}/algorithm/getScen${capitalize(query)}Info/${id}`),
    enabled: !!query && !!id,
  });

export const useScenarioOnAgentData = (query: Metric, id: string) =>
  useQuery({
    queryKey: ["scenarioOnAgentData", query, id],
    queryFn: () =>
      json<
        {
          scen_type: string;
          type_id: number;
          solved_instances: AlgorithmCollectionCount[];
        }[]
      >(`${APIConfig.apiUrl}/algorithm/getAgent${capitalize(query)}Info/${id}`),
    enabled: !!query && !!id,
  });

export const useScenarioOnAgentGapData = (
  query: ScenarioMetric,
  map: string | number,
  scenario: string | number
) =>
  useQuery({
    queryKey: ["scenarioOnAgentGapData", query, map, scenario],
    queryFn: () =>
      json<
        {
          agents: number;
          record: (Algorithm & { cost: number })[];
        }[]
      >(
        `${APIConfig.apiUrl}/algorithm/getAgent${upperFirst(
          query
        )}/${map}&${scenario}`
      ),
    enabled: !!query && !!map && !!scenario,
  });
