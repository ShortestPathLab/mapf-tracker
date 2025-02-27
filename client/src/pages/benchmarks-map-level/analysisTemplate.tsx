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
      name: `Trends in ${mapName}`,
      icon: <ShowChartOutlined />,
      variants: [
        {
          name: "Completion per algorithm",
          render: () => <AlgorithmByScenarioChart map={mapId} />,
        },
        {
          name: "Completion by agent count per algorithm",
          render: () => <AlgorithmByAgentChart map={mapId} />,
        },
        {
          name: "Completion by scenario type",
          render: () => <SuccessRateChart map={mapId} />,
        },
        {
          name: "Completion by agent count",
          render: () => <SuccessRateOnAgentsChart map={mapId} />,
        },
      ],
    },
  ];
}
