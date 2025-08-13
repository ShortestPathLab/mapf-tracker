import { ShowChartRounded } from "@mui-symbols-material/w400";
import { Map, Scenario } from "core/types";
import { CostChart } from "./charts/CostChart";
import {
  LowerBoundChart,
  LowerBoundComparisonChart,
} from "./charts/LowerBoundChart";

export function analysisTemplate(scenarioData?: Scenario) {
  return [
    {
      name: ``,
      icon: <ShowChartRounded />,
      variants: [
        {
          name: "Cost by agent count",
          render: () => <CostChart scenario={scenarioData?.id} />,
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
