import {
  DownloadRounded,
  MapRounded,
  TableRounded,
} from "@mui-symbols-material/w400";
import { CardActionArea, Stack, Tooltip } from "@mui/material";
import { Analysis } from "components/analysis/Analysis";
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
import { downloadMap } from "pages/benchmarks-root-level/download";
import { useMapData, useScenario } from "queries/useMapQuery";
import { analysisTemplate, compareTemplate } from "./analysisTemplate";
import { ScenarioLevelLocationState } from "./ScenarioLevelLocationState";
import Table from "./Table";
import { useSurface } from "components/surface";
import { MapVisualisationDialog } from "pages/benchmarks-map-level/MapVisualisationDialog";

export default function Page() {
  const state = useStableLocationState<ScenarioLevelLocationState>();
  const { mapId, scenId } = state;
  const { data: mapData } = useMapData(mapId);
  const { data: scenarioData } = useScenario(scenId);
  const notify = useSnackbarAction();

  const title =
    scenarioData && `${scenarioData?.scen_type}-${scenarioData?.type_id}`;
  const { open: openPreview, dialog: previewDialog } = useSurface(
    MapVisualisationDialog,
    {
      title:
        mapData && title
          ? `${startCase(mapData.map_name)}, ${startCase(title)}`
          : "--",
      variant: "fullscreen",
      slotProps: {
        appBar: {
          sx: {
            background: "transparent",
            width: "fit-content",
          },
        },
      },
    }
  );
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
        <Tooltip title="Enlarge">
          <CardActionArea
            sx={{ borderRadius: 1 }}
            onClick={() => openPreview({ mapId, scenarioId: scenarioData?.id })}
          >
            <PreviewCard
              scenario={scenarioData?.id}
              sx={{ width: "100%", height: "auto", aspectRatio: 1 }}
            />
          </CardActionArea>
        </Tooltip>
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
      actions={{
        options: [
          {
            label: "Export scenario file (.scen)",
            primary: true,
            action: notify(
              () => downloadScenario(mapData?.map_name)(scenarioData),
              {
                start: "Preparing...",
                end: "Done",
              }
            ),
            icon: <DownloadRounded />,
          },
          {
            label: "Export map (.map)",
            icon: <MapRounded />,
            action: notify(() => downloadMap(mapData), {
              start: "Preparing...",
              end: "Done",
            }),
          },
          {
            label: "Results (.csv)",
            action: notify(
              () => downloadInstance(mapData?.map_name)(scenarioData),
              {
                start: "Preparing",
                end: "Done",
              }
            ),
            icon: <TableRounded />,
          },
        ],
      }}
    >
      <Stack gap={4}>
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
      {previewDialog}
    </GalleryLayout>
  );
}
