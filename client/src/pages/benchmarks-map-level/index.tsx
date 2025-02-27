import { Link, useTheme } from "@mui/material";
import { PreviewCard } from "components/PreviewCard";
import { Analysis } from "components/analysis/Analysis";
import { useLocationState } from "hooks/useNavigation";
import { DataInspectorLayout } from "layout/DataInspectorLayout";
import { GalleryLayout } from "layout/GalleryLayout";
import { startCase } from "lodash";
import { downloadBenchmarks } from "pages/benchmarks-root-level/download";
import { useMapData } from "queries/useBenchmarksQuery";
import { MapLevelLocationState } from "./MapLevelLocationState";
import Table from "./Table";
import { analysisTemplate } from "./analysisTemplate";

export default function Page() {
  const { mapName, mapId } = useLocationState<MapLevelLocationState>();
  const { data: mapData } = useMapData(mapId);
  const theme = useTheme();
  return (
    <GalleryLayout
      title={startCase(mapName)}
      description={`Problem instances on this map, grouped by scenario`}
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
      <DataInspectorLayout
        analysisTabName="Trends"
        data={<Table />}
        analysis={<Analysis template={analysisTemplate(mapName, mapId)} />}
      />
    </GalleryLayout>
  );
}
