import { ShowChartRounded } from "@mui-symbols-material/w400";
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
      name: `Trends in ${capitalize(
        `${scenType}-${scenTypeID}`
      )} in ${mapName}`,
      icon: <ShowChartRounded />,
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
