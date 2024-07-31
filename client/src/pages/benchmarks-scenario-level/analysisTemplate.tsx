import { ShowChartOutlined } from "@mui/icons-material";
import { capitalize } from "lodash";
import {
  LowerBoundChart,
  LowerBoundComparisonChart,
} from "./charts/LowerBoundChart";

export function analysisTemplate(
  scenType: string,
  scenTypeID: number,
  mapName: string,
  scenId: string | number,
  mapId: string
) {
  return [
    {
      name: `Analysis of ${capitalize(
        `${scenType}-${scenTypeID}`
      )} in ${mapName}`,
      icon: <ShowChartOutlined />,
      variants: [
        {
          name: "Percent suboptimality",
          render: () => <LowerBoundChart scenario={scenId} />,
        },
        {
          name: "Per-algorithm analysis",
          render: () => (
            <LowerBoundComparisonChart map={mapId} scenario={scenId} />
          ),
        },
      ],
    },
  ];
}
