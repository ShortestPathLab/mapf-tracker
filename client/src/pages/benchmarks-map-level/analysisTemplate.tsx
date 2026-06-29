import { ShowChartRounded } from "@mui-symbols-material/w300";
import { Map } from "core/types";
import { AlgorithmByAgentChart } from "./charts/AlgorithmByAgentChart";
import { AlgorithmByScenarioChart } from "./charts/AlgorithmByScenarioChart";
import { SuccessRateChart, SuccessRateOnAgentsChart } from "./charts/SuccessRateChart";
import { SuboptimalityByAgentCountChart } from "components/charts/SuboptimalityByAgentCountChart";
import AlgorithmByScenarioDoc from "docs/charts/AlgorithmByScenario.md";
import AlgorithmByAgentDoc from "docs/charts/AlgorithmByAgent.md";
import SuccessRateDoc from "docs/charts/SuccessRate.md";
import SuccessRateOnAgentsDoc from "docs/charts/SuccessRateOnAgents.md";
import SuboptimalityByAgentCountDoc from "docs/charts/SuboptimalityByAgentCount.md";

export function compareTemplate(mapData?: Map) {
  return [
    {
      name: "",
      icon: <ShowChartRounded />,
      variants: [
        {
          name: "Completion per algorithm, by scenario type",
          render: () => <AlgorithmByScenarioChart map={mapData?.id ?? ""} />,
          documentation: <AlgorithmByScenarioDoc />,
        },
        {
          name: "Completion per algorithm, by agent count per algorithm",
          render: () => <AlgorithmByAgentChart map={mapData?.id ?? ""} />,
          documentation: <AlgorithmByAgentDoc />,
        },
      ],
    },
  ];
}
export function analysisTemplate(mapData?: Map) {
  return [
    {
      name: "",
      icon: <ShowChartRounded />,
      variants: [
        {
          name: "Completion by scenario type",
          render: () => <SuccessRateChart map={mapData?.id ?? ""} />,
          documentation: <SuccessRateDoc />,
        },
        {
          name: "Completion by agent count",
          render: () => <SuccessRateOnAgentsChart map={mapData?.id ?? ""} />,
          documentation: <SuccessRateOnAgentsDoc />,
        },
        {
          name: "Suboptimality by agent count",
          render: () => <SuboptimalityByAgentCountChart map={mapData?.id} />,
          documentation: <SuboptimalityByAgentCountDoc />,
        },
      ],
    },
  ];
}
