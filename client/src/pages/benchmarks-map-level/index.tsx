import {
  DownloadRounded,
  MapRounded,
  TableRounded,
} from "@mui-symbols-material/w400";
import { Link, Stack, useTheme } from "@mui/material";
import { DownloadBar } from "components/DownloadBar";
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
        {
          label: "Download benchmark",
          value: (
            <Link href="#" onClick={() => downloadBenchmarks(mapData)}>
              {`${mapData?.map_name}.zip`}
            </Link>
          ),
        },
      ]}
    >
      <Stack sx={{ gap: 4 }}>
        {!!mapData && (
          <DownloadBar
            options={[
              {
                label: "Scenario files (.zip)",
                icon: <DownloadRounded />,
                primary: true,
                action: () => downloadBenchmarks(mapData),
                // open({
                //   initialMaps: [mapData?.map_name],
                // }),
              },
              {
                label: "Map (.map)",
                icon: <MapRounded />,
                action: () => downloadMap(mapData),
              },
              {
                label: "Results (.csv)",
                icon: <TableRounded />,
                action: () => downloadBenchmarksResultsCSV(mapData),
              },
            ]}
          />
        )}
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
