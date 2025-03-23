import { ShowChartRounded } from "@mui-symbols-material/w400";
import { AlgorithmByMapChart } from "./charts/AlgorithmByMapChart";
import { AlgorithmByMapTypeChart } from "./charts/AlgorithmByMapTypeChart";
import { MapProportionByDomainChart } from "./charts/MapProportionByDomainChart";
import { MapProportionChart } from "./charts/MapProportionChart";
import { CompletionByAgentCountChart } from "components/charts/CompletionByAgentCountChart";

export const analysisTemplate = [
  {
    name: undefined,
    icon: <ShowChartRounded />,
    variants: [
      {
        name: "Completion by domain",
        description: "Instances closed and solved across domains",
        render: () => <MapProportionChart />,
      },
      {
        name: "Completion by agent count",
        description: "Instances solved and closed across agent count",
        render: () => <CompletionByAgentCountChart />,
      },
      {
        name: "Completion by individual maps",
        description: "Instances solved, closed, and open across maps",
        render: () => <MapProportionByDomainChart />,
      },
    ],
  },
];
export const compareTemplate = [
  {
    name: undefined,
    icon: <ShowChartRounded />,
    variants: [
      {
        name: "Algorithm by domain",
        render: () => <AlgorithmByMapTypeChart />,
      },
      {
        name: "Algorithm by individual maps",
        render: () => <AlgorithmByMapChart />,
      },
    ],
  },
];
