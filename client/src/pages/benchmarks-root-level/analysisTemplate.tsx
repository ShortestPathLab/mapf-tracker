import { ShowChartOutlined } from "@mui/icons-material";
import { AlgorithmByMapChart } from "./charts/AlgorithmByMapChart";
import { AlgorithmByMapTypeChart } from "./charts/AlgorithmByMapTypeChart";
import { MapProportionByDomainChart } from "./charts/MapProportionByDomainChart";
import { MapProportionChart } from "./charts/MapProportionChart";

export const analysisTemplate = [
  {
    name: "Dataset analysis",
    icon: <ShowChartOutlined />,
    variants: [
      {
        name: "By map type",
        render: () => <MapProportionChart />,
      },
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
