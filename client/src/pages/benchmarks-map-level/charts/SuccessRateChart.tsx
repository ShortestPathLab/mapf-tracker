import { useTheme } from "@mui/material";
import { Chart } from "components/analysis/Chart";
import {
  aggregateInstances,
  getInstanceAggregateProportions,
} from "components/analysis/reducers";
import { successRateBarChartRenderer } from "components/analysis/successRateBarChartRenderer";
import { capitalize, chain, identity } from "lodash";
import { useScenarioSuccessRateByAgentCountData } from "queries/useAlgorithmQuery";
import { useInstanceCollectionsData } from "queries/useBenchmarksQuery";

export function SuccessRateChart({ map }: { map: string }) {
  const { palette } = useTheme();
  const { data, isLoading } = useInstanceCollectionsData(map);
  return (
    <Chart
      isLoading={isLoading}
      data={chain(data)
        .groupBy((c) => `${c.scen_type}-${c.type_id}`)
        .mapValues(aggregateInstances)
        .mapValues(getInstanceAggregateProportions)
        .mapValues((c) => ({
          ...c,
          proportionSolved: c.proportionSolved - c.proportionClosed,
          proportionUnknown: 1 - c.proportionSolved,
        }))
        .entries()
        .map(([k, v]) => ({
          ...v,
          key: k,
          name: capitalize(k),
        }))
        .sortBy(["type", "proportionClosed"])
        .value()}
      render={successRateBarChartRenderer({ mode: palette.mode })}
    />
  );
}

export function SuccessRateOnAgentsChart({ map }: { map: string }) {
  const { palette } = useTheme();
  const { data, isLoading } = useScenarioSuccessRateByAgentCountData(map);
  return (
    <Chart
      isLoading={isLoading}
      data={data}
      render={successRateBarChartRenderer({
        mode: palette.mode,
        xAxisDataKey: "name",
        proportionClosedKey: "Closed",
        proportionSolvedKey: "Solved",
        formatter: identity,
      })}
    />
  );
}
