import { ShowChartRounded } from "@mui-symbols-material/w300";
import { AlgorithmByMapChart } from "./charts/AlgorithmByMapChart";
import { AlgorithmByMapTypeChart } from "./charts/AlgorithmByMapTypeChart";
import { MapProportionByDomainChart } from "./charts/MapProportionByDomainChart";
import { MapProportionChart } from "./charts/MapProportionChart";
import { CompletionByAgentCountChart } from "components/charts/CompletionByAgentCountChart";
import { AlgorithmByAgentCountChart } from "./charts/AlgorithmByAgentCountChart";
import { SuboptimalityByAgentCountChart } from "components/charts/SuboptimalityByAgentCountChart";
import MapProportionDoc from "docs/charts/MapProportion.md";
import CompletionByAgentCountDoc from "docs/charts/CompletionByAgentCount.md";
import MapProportionByDomainDoc from "docs/charts/MapProportionByDomain.md";
import SuboptimalityByAgentCountDoc from "docs/charts/SuboptimalityByAgentCount.md";
import AlgorithmByMapTypeDoc from "docs/charts/AlgorithmByMapType.md";
import AlgorithmByMapDoc from "docs/charts/AlgorithmByMap.md";
import AlgorithmByAgentCountDoc from "docs/charts/AlgorithmByAgentCount.md";

export const analysisTemplate = [
  {
    name: undefined,
    icon: <ShowChartRounded />,
    variants: [
      {
        name: "Completion by domain",
        description: "Instances closed and solved across domains",
        render: () => <MapProportionChart />,
        documentation: <MapProportionDoc />,
      },
      {
        name: "Completion by agent count",
        description: "Instances solved and closed across agent count",
        render: () => <CompletionByAgentCountChart />,
        documentation: <CompletionByAgentCountDoc />,
      },
      {
        name: "Completion by individual maps",
        description: "Instances solved, closed, and open across maps",
        render: () => <MapProportionByDomainChart />,
        documentation: <MapProportionByDomainDoc />,
      },
      {
        name: "Suboptimality by agent count",
        description: "Range of suboptimality across agent counts",
        render: () => <SuboptimalityByAgentCountChart />,
        documentation: <SuboptimalityByAgentCountDoc />,
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
        documentation: <AlgorithmByMapTypeDoc />,
      },
      {
        name: "Algorithm by individual maps",
        render: () => <AlgorithmByMapChart />,
        documentation: <AlgorithmByMapDoc />,
      },
      {
        name: "Algorithm by agent count",
        render: () => <AlgorithmByAgentCountChart />,
        documentation: <AlgorithmByAgentCountDoc />,
      },
    ],
  },
];
