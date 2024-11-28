import { Box, Skeleton, Stack } from "@mui/material";
import { DataGridTitle } from "components/data-grid";
import Enter from "components/dialog/Enter";
import { isUndefined, startCase } from "lodash";
import pluralize from "pluralize";
import { useMapData } from "queries/useBenchmarksQuery";

export function MapLabel({ mapId, count }: { mapId: string; count?: number }) {
  const { data: map, isLoading } = useMapData(mapId);
  return (
    <Enter in axis="x">
      <Stack direction="row" sx={{ gap: 2, alignItems: "center" }}>
        {!isLoading && map?.map_name ? (
          <Box
            component="img"
            sx={{ borderRadius: 1, height: 48, width: 48 }}
            src={`/mapf-svg/${map?.map_name}.svg`}
          />
        ) : (
          <Skeleton sx={{ width: 48, height: 48 }} variant="rounded" />
        )}
        <DataGridTitle
          primary={startCase(map?.map_name ?? "-")}
          secondary={
            isUndefined(count) ? "Map" : pluralize("item", count, true)
          }
        />
      </Stack>
    </Enter>
  );
}
