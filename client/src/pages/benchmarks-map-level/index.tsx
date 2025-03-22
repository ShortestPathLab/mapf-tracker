import {
  DownloadRounded,
  MapRounded,
  TableRounded,
} from "@mui-symbols-material/w400";
import { Stack, useTheme } from "@mui/material";
import { PreviewCard } from "components/PreviewCard";
import { Analysis } from "components/analysis/Analysis";
import { useSurface } from "components/surface";
import { useStableLocationState } from "hooks/useStableLocationState";
import { DataInspectorLayout } from "layout/DataInspectorLayout";
import { GalleryLayout } from "layout/GalleryLayout";
import { startCase } from "lodash";
import {
  downloadBenchmarks,
  downloadBenchmarksResultsCSV,
  downloadMap,
} from "pages/benchmarks-root-level/download";
import { useMapData } from "queries/useBenchmarksQuery";
import { DownloadOptions } from "./DownloadOptions";
import { MapLevelLocationState } from "./MapLevelLocationState";
import Table from "./Table";
import { analysisTemplate, compareTemplate } from "./analysisTemplate";

export default function Page() {
  const { open, dialog } = useSurface(DownloadOptions, {
    title: "Download options",
  });
  const { mapId } = useStableLocationState<MapLevelLocationState>();
  const { data: mapData } = useMapData(mapId);
  const theme = useTheme();
  return (
    <GalleryLayout
      title={mapData ? startCase(mapData.map_name) : "--"}
      path={[
        { name: "Home", url: "/" },
        { name: "Benchmarks", url: "/benchmarks" },
      ]}
      cover={
        <PreviewCard
          palette={{ obstacle: theme.palette.text.primary }}
          map={mapId}
          sx={{ width: "100%", height: "auto", aspectRatio: 1 }}
        />
      }
      items={[
        { value: <code>{mapData?.map_name}</code>, label: "Map ID" },
        { value: mapData?.map_size, label: "Map size" },
        { value: startCase(mapData?.map_type), label: "Map type" },
        { value: mapData?.scens, label: "Scenario count" },
        { value: mapData?.instances, label: "Instance count" },
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
        !!mapData && {
          options: [
            {
              label: "Export scenario files (.zip)",
              icon: <DownloadRounded />,
              primary: true,
              action: () => downloadBenchmarks(mapData),
              // open({
              //   initialMaps: [mapData?.map_name],
              // }),
            },
            {
              label: "Export map (.map)",
              icon: <MapRounded />,
              action: () => downloadMap(mapData),
            },
            {
              label: "Export results (.csv)",
              icon: <TableRounded />,
              action: () => downloadBenchmarksResultsCSV(mapData),
            },
          ],
        }
      }
    >
      <Stack sx={{ gap: 4 }}>
        <DataInspectorLayout
          dataTabName="Browse scenarios"
          analysisTabName="Trends"
          data={<Table />}
          analysis={<Analysis template={analysisTemplate(mapData)} />}
          compare={<Analysis template={compareTemplate(mapData)} />}
        />
      </Stack>
      {dialog}
    </GalleryLayout>
  );
}
