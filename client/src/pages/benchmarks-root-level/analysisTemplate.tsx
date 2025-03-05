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
        name: "By map type",
        render: () => <MapProportionChart />,
      },
      { name: "By agent count", render: () => <CompletionByAgentCountChart /> },
      {
        name: "Individual maps",
        render: () => <MapProportionByDomainChart />,
      },
      {
        name: "Algorithm by map type",
        render: () => <AlgorithmByMapTypeChart />,
      },
      {
        name: "Algorithm by individual maps",
        render: () => <AlgorithmByMapChart />,
      },
    ],
  },
];
