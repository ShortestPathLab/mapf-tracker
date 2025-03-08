import { Stack } from "@mui/material";
import { DownloadBar } from "components/DownloadBar";
import { PreviewCard } from "components/PreviewCard";
import { Analysis } from "components/analysis/Analysis";
import { useLocationState } from "hooks/useNavigation";
import { DataInspectorLayout } from "layout/DataInspectorLayout";
import { GalleryLayout } from "layout/GalleryLayout";
import { startCase } from "lodash";
import { useMapData, useScenarioDetailsData } from "queries/useBenchmarksQuery";
import { ScenarioLevelLocationState } from "./ScenarioLevelLocationState";
import Table from "./Table";
import { analysisTemplate } from "./analysisTemplate";

export default function Page() {
  const state = useLocationState<ScenarioLevelLocationState>();
  const { mapId, scenId } = state;
  const { data: mapData } = useMapData(mapId);
  const { data: scenarioData } = useScenarioDetailsData(scenId);
  const title =
    scenarioData && `${scenarioData?.scen_type}-${scenarioData?.type_id}`;
  return (
    <GalleryLayout
      title={title ? startCase(title) : "--"}
      path={[
        { name: "Home", url: "/" },
        { name: "Benchmarks", url: "/benchmarks" },
        {
          name: startCase(mapData?.map_name),
          url: "/scenarios",
          state,
        },
      ]}
      cover={
        <PreviewCard
          scenario={scenarioData?.id}
          sx={{ width: "100%", height: "auto", aspectRatio: 1 }}
        />
      }
      items={[
        {
          value: scenarioData && <code>{scenarioData.scen_type}</code>,
          label: "Type",
        },
        {
          value: scenarioData && <code>{scenarioData.type_id}</code>,
          label: "Type ID",
        },
        { value: mapData && <code>{mapData.map_name}</code>, label: "Map ID" },
        {
          value: scenarioData?.instances,
          label: "Instance count",
        },
      ]}
    >
      <Stack gap={4}>
        <DownloadBar />
        <DataInspectorLayout
          analysisTabName="Trends"
          dataTabName="Browse instances"
          data={<Table />}
          analysis={<Analysis template={analysisTemplate(scenId, mapId)} />}
        />
      </Stack>
    </GalleryLayout>
  );
}
