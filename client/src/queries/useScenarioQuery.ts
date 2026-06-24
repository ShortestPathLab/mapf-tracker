import { useQuery } from "@tanstack/react-query";
import { Metric, ScenarioMetric } from "core/metrics";
import { Algorithm, AlgorithmCollectionCount } from "core/types";
import api, { untyped } from "hooks/useQuery";

type ScenarioInfo = {
  scen_type: string;
  type_id: number;
  solved_instances: AlgorithmCollectionCount[];
};

type AgentGap = {
  agents: number;
  record: (Algorithm & { cost: number })[];
};

// The path segment encodes the metric, so map each metric to its static treaty
// node rather than building the path dynamically (which Eden can't type).
const scenInfoRoutes = {
  solved: api.api.algorithm.getScenSolvedInfo,
  solution: api.api.algorithm.getScenSolutionInfo,
  closed: api.api.algorithm.getScenClosedInfo,
  lower: api.api.algorithm.getScenLowerInfo,
} as const;

const agentInfoRoutes = {
  solved: api.api.algorithm.getAgentSolvedInfo,
  solution: api.api.algorithm.getAgentSolutionInfo,
  closed: api.api.algorithm.getAgentClosedInfo,
  lower: api.api.algorithm.getAgentLowerInfo,
} as const;

const agentGapRoutes = {
  solutionCost: api.api.algorithm.getAgentSolutionCost,
  lower: api.api.algorithm.getAgentLower,
} as const;

export const useScenarioData = (query: Metric, id: string) =>
  useQuery({
    queryKey: ["scenarioData", query, id],
    queryFn: () => untyped<ScenarioInfo[]>(scenInfoRoutes[query]({ id }).get()),
    enabled: !!query && !!id,
  });

export const useScenarioOnAgentData = (query: Metric, id: string) =>
  useQuery({
    queryKey: ["scenarioOnAgentData", query, id],
    queryFn: () => untyped<ScenarioInfo[]>(agentInfoRoutes[query]({ id }).get()),
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
      untyped<AgentGap[]>(
        // `query` is a scenarioMetrics key at runtime ("solutionCost" | "lower");
        // the ScenarioMetric alias is wider (pre-existing). The combined map &
        // scenario are passed as a single `:pair` param split on `&` server-side.
        agentGapRoutes[query as keyof typeof agentGapRoutes]({
          pair: `${map}&${scenario}`,
        }).get()
      ),
    enabled: !!query && !!map && !!scenario,
  });
