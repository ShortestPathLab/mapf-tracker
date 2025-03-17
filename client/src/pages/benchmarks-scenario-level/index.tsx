import {
  DownloadRounded,
  MapRounded,
  TableRounded,
} from "@mui-symbols-material/w400";
import { Stack } from "@mui/material";
import { DownloadBar } from "components/DownloadBar";
import { PreviewCard } from "components/PreviewCard";
import { useSnackbarAction } from "components/Snackbar";
import { useStableLocationState } from "hooks/useStableLocationState";
import { DataInspectorLayout } from "layout/DataInspectorLayout";
import { GalleryLayout } from "layout/GalleryLayout";
import { startCase } from "lodash";
import {
  downloadInstance,
  downloadScenario,
} from "pages/benchmarks-map-level/download";
import { useMapData, useScenarioDetailsData } from "queries/useBenchmarksQuery";
import { ScenarioLevelLocationState } from "./ScenarioLevelLocationState";
import Table from "./Table";
import { Analysis } from "components/analysis/Analysis";
import { analysisTemplate, compareTemplate } from "./analysisTemplate";
import { downloadMap } from "pages/benchmarks-root-level/download";

export default function Page() {
  const state = useStableLocationState<ScenarioLevelLocationState>();
  const { mapId, scenId } = state;
  const { data: mapData } = useMapData(mapId);
  const { data: scenarioData } = useScenarioDetailsData(scenId);
  const notify = useSnackbarAction();
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
        <DownloadBar
          options={[
            {
              label: "Scenario file (.scen)",
              primary: true,
              action: notify(
                () => downloadScenario(mapData?.map_name)(scenarioData),
                {
                  end: "Scenario downloaded",
                }
              ),
              icon: <DownloadRounded />,
            },
            {
              label: "Map (.map)",
              icon: <MapRounded />,
              action: () => downloadMap(mapData),
            },
            {
              label: "Results (.csv)",
              action: notify(
                () => downloadInstance(mapData?.map_name)(scenarioData),
                {
                  end: "Results downloaded",
                }
              ),
              icon: <TableRounded />,
            },
          ]}
        />
        <DataInspectorLayout
          analysisTabName="Trends"
          dataTabName="Browse instances"
          data={<Table />}
          analysis={<Analysis template={analysisTemplate(scenarioData)} />}
          compare={
            <Analysis template={compareTemplate(scenarioData, mapData)} />
          }
        />
      </Stack>
    </GalleryLayout>
  );
}
