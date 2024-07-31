import { ShowChartOutlined } from "@mui/icons-material";
import { AlgorithmByAgentChart } from "./charts/AlgorithmByAgentChart";
import { AlgorithmByScenarioChart } from "./charts/AlgorithmByScenarioChart";
import {
  SuccessRateChart,
  SuccessRateOnAgentsChart,
} from "./charts/SuccessRateChart";

export function analysisTemplate(mapName: string, mapId: string) {
  return [
    {
      name: `Analysis of ${mapName}`,
      icon: <ShowChartOutlined />,
      variants: [
        {
          name: "By scenario",
          render: () => <SuccessRateChart map={mapId} />,
        },
        {
          name: "By agent count",
          render: () => <SuccessRateOnAgentsChart map={mapId} />,
        },
        {
          name: "Algorithms by scenario",
          render: () => <AlgorithmByScenarioChart map={mapId} />,
        },
        {
          name: "Algorithms by agent count",
          render: () => <AlgorithmByAgentChart map={mapId} />,
        },
      ],
    },
  ];
}
