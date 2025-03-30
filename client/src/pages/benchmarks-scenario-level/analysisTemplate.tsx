import { ShowChartRounded } from "@mui-symbols-material/w400";
import { Map, Scenario } from "core/types";
import {
  LowerBoundChart,
  LowerBoundComparisonChart,
} from "./charts/LowerBoundChart";
import { SuccessRateOnAgentsChart } from "pages/benchmarks-map-level/charts/SuccessRateChart";

export function analysisTemplate(scenarioData?: Scenario) {
  return [
    {
      name: ``,
      icon: <ShowChartRounded />,
      variants: [
        {
          name: "Completion by agent count",
          render: () => (
            <SuccessRateOnAgentsChart
              scenario={scenarioData?.id}
              map={scenarioData?.map_id}
            />
          ),
        },
        {
          name: "Percent suboptimality",
          description:
            "Percent difference between best solution and lower-bound",
          render: () => <LowerBoundChart scenario={scenarioData?.id} />,
        },
      ],
    },
  ];
}
export function compareTemplate(scenarioData?: Scenario, mapData?: Map) {
  return [
    {
      name: ``,
      icon: <ShowChartRounded />,
      variants: [
        {
          name: "Per-algorithm analysis",
          render: () => (
            <LowerBoundComparisonChart
              map={mapData?.id}
              scenario={scenarioData?.id}
            />
          ),
        },
      ],
    },
  ];
}
