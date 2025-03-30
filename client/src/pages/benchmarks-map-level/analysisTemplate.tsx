import { ShowChartRounded } from "@mui-symbols-material/w400";
import { Map } from "core/types";
import { AlgorithmByAgentChart } from "./charts/AlgorithmByAgentChart";
import { AlgorithmByScenarioChart } from "./charts/AlgorithmByScenarioChart";
import {
  SuccessRateChart,
  SuccessRateOnAgentsChart,
} from "./charts/SuccessRateChart";

export function compareTemplate(mapData: Map) {
  return [
    {
      name: "",
      icon: <ShowChartRounded />,
      variants: [
        {
          name: "Completion per algorithm, by scenario type",
          render: () => <AlgorithmByScenarioChart map={mapData?.id} />,
        },
        {
          name: "Completion per algorithm, by agent count per algorithm",
          render: () => <AlgorithmByAgentChart map={mapData?.id} />,
        },
      ],
    },
  ];
}
export function analysisTemplate(mapData: Map) {
  return [
    {
      name: "",
      icon: <ShowChartRounded />,
      variants: [
        {
          name: "Completion by scenario type",
          render: () => <SuccessRateChart map={mapData?.id} />,
        },
        {
          name: "Completion by agent count",
          render: () => <SuccessRateOnAgentsChart map={mapData?.id} />,
        },
      ],
    },
  ];
}
