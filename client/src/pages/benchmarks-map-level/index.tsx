import {
  FolderZipRounded,
  MapRounded,
  TableRounded,
} from "@mui-symbols-material/w300";
import {
  CardActionArea,
  Divider,
  Stack,
  Tooltip,
  useTheme,
} from "@mui/material";
import { PreviewCard } from "components/PreviewCard";
import { useSnackbarAction } from "components/Snackbar";
import { Analysis } from "components/analysis/Analysis";
import { useSurface } from "components/surface";
import { useStableLocationState } from "hooks/useStableLocationState";
import { DataInspectorLayout } from "layout/DataInspectorLayout";
import { GalleryLayout } from "layout/GalleryLayout";
import { max, startCase } from "lodash";
import {
  downloadBenchmarks,
  downloadBenchmarksResultsCSV,
  downloadMap,
} from "pages/benchmarks-root-level/download";
import { useMapData, useScenariosByMap } from "queries/useMapQuery";
import { MapLevelLocationState } from "./MapLevelLocationState";
import { MapVisualisationDialog } from "./MapVisualisationDialog";
import Table from "./Table";
import { analysisTemplate, compareTemplate } from "./analysisTemplate";
import { Item } from "components/Item";
import { ItemGrid } from "components/ItemGrid";

export default function Page() {
  const { mapId } =
    useStableLocationState<MapLevelLocationState>() as MapLevelLocationState;
  const { data: mapData } = useMapData(mapId);
  const { data: mapScenarios } = useScenariosByMap(mapId);
  const { open: openPreview, dialog: previewDialog } = useSurface(
    MapVisualisationDialog,
    {
      variant: "fullscreen",
      title: mapData ? startCase(mapData.map_name) : "--",
      slotProps: {
        appBar: {
          sx: {
            background: "transparent",
            width: "fit-content",
          },
        },
      },
    },
  );
  const theme = useTheme();
  const notify = useSnackbarAction();
  return (
    <GalleryLayout
      title={mapData ? startCase(mapData.map_name) : "--"}
      path={[
        { name: "Home", url: "/" },
        { name: "Benchmarks", url: "/benchmarks" },
      ]}
      cover={
        <Tooltip title="Enlarge">
          <CardActionArea
            sx={{ borderRadius: 1 }}
            onClick={() => openPreview({ mapId })}
          >
            <PreviewCard
              palette={{ obstacle: theme.palette.text.primary }}
              map={mapId}
              sx={{ width: "100%", height: "auto", aspectRatio: 1 }}
            />
          </CardActionArea>
        </Tooltip>
      }
      items={[
        { value: <code>{mapData?.map_name}</code>, label: "Map ID" },
        { value: mapData?.map_size, label: "Map size" },
        { value: startCase(mapData?.map_type), label: "Map type" },

        {
          value: mapData?.original_link ?? "No link provided",
          label: "Original link",
        },
        {
          value: mapData?.papers ?? "No references",
          label: "References",
        },
      ]}
      actions={
        mapData
          ? {
              options: [
                {
                  label: "Export scenario files (.zip)",
                  icon: <FolderZipRounded />,
                  primary: true,
                  action: notify(() => downloadBenchmarks(mapData), {
                    start: "Preparing...",
                    end: "Done",
                  }),
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
                  label: "Export results (.csv)",
                  icon: <TableRounded />,
                  action: notify(() => downloadBenchmarksResultsCSV(mapData), {
                    start: "Preparing...",
                    end: "Done",
                  }),
                },
              ],
            }
          : undefined
      }
    >
      <ItemGrid
        width={180}
        items={[
          { value: mapData?.scens, label: "Scenario count" },
          { value: mapData?.instances, label: "Instance count" },
          {
            value: max(mapScenarios?.map((s) => s.instances)),
            label: "Maximum agents",
          },
        ].map(({ value, label }) => (
          <Item
            key={label}
            primary={value?.toLocaleString?.() ?? "--"}
            secondary={label}
            invert
          />
        ))}
      />
      <Stack sx={{ gap: 4 }}>
        <DataInspectorLayout
          dataTabName="Browse scenarios"
          analysisTabName="Trends"
          data={<Table />}
          analysis={
            <Analysis template={analysisTemplate(mapData ?? undefined)} />
          }
          compare={
            <Analysis template={compareTemplate(mapData ?? undefined)} />
          }
        />
      </Stack>
      {previewDialog}
    </GalleryLayout>
  );
}
