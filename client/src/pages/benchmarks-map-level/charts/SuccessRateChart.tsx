import { Chart } from "components/analysis/Chart";
import {
  aggregateInstances,
  getInstanceAggregateProportions,
} from "components/analysis/reducers";
import { capitalize, chain } from "lodash";
import { CompletionByAgentCountChart } from "components/charts/CompletionByAgentCountChart";
import { CategoryChart } from "components/charts/CompletionByAlgorithmChart";
import { useInstanceScenarioData } from "queries/useBenchmarksQuery";

export function SuccessRateChart({ map }: { map: string }) {
  const { data, isLoading } = useInstanceScenarioData(map);
  return (
    <Chart
      isLoading={isLoading}
      data={chain(data)
        .groupBy((c) => `${c.scen_type}`)
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
          label: capitalize(k),
        }))
        .sortBy(["type", "proportionClosed"])
        .value()}
      render={<CategoryChart showLabels />}
    />
  );
}

export function SuccessRateOnAgentsChart({
  map,
  scenario,
}: {
  map: string;
  scenario?: string;
}) {
  return <CompletionByAgentCountChart partialQuery={{ map, scenario }} />;
}
