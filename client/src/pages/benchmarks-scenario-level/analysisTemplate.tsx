import { ShowChartRounded } from "@mui-symbols-material/w400";
import { capitalize } from "lodash";
import {
  LowerBoundChart,
  LowerBoundComparisonChart,
} from "./charts/LowerBoundChart";
import { useMapData, useScenarioDetailsData } from "queries/useBenchmarksQuery";

export function analysisTemplate(scenId: string | number, mapId: string) {
  const { data: mapData } = useMapData(mapId);
  const { data: scenarioData } = useScenarioDetailsData(scenId);
  return [
    {
      name: `Trends in ${capitalize(
        `${scenarioData?.scen_type}-${scenarioData?.type_id}`
      )} in ${mapData?.map_name}`,
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
