import { Stack, useTheme } from "@mui/material";
import { Item } from "components/Item";
import { PreviewCard } from "components/PreviewCard";
import { isUndefined, startCase } from "lodash";
import { PreviewCollection } from "pages/benchmarks-root-level";
import pluralize from "pluralize";
import { useMapData } from "queries/useBenchmarksQuery";

export function MapLabel({ mapId, count }: { mapId: string; count?: number }) {
  const { data: map } = useMapData(mapId);
  const theme = useTheme();
  return (
    <Stack direction="row" sx={{ gap: 2, alignItems: "center" }}>
      <Stack sx={{ width: 48, pt: 1 }}>
        <PreviewCollection
          preview={
            <PreviewCard
              map={mapId}
              palette={{ obstacle: theme.palette.text.primary }}
            />
          }
        />
      </Stack>
      <Item
        primary={startCase(map?.map_name ?? "-")}
        secondary={
          isUndefined(count)
            ? `Map, ${map?.map_type}, ${map?.map_size}`
            : pluralize("item", count, true)
        }
      />
    </Stack>
  );
}
