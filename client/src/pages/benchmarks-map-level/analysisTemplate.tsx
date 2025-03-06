import { ShowChartRounded } from "@mui-symbols-material/w400";
import { AlgorithmByAgentChart } from "./charts/AlgorithmByAgentChart";
import { AlgorithmByScenarioChart } from "./charts/AlgorithmByScenarioChart";
import {
  SuccessRateChart,
  SuccessRateOnAgentsChart,
} from "./charts/SuccessRateChart";
import { useMapData } from "queries/useBenchmarksQuery";

export function analysisTemplate(mapId: string) {
  const { data: mapData } = useMapData(mapId);
  return [
    {
      name: `Trends in ${mapData?.map_name}`,
      icon: <ShowChartRounded />,
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
