import { Button, Stack, Typography } from "@mui/material";
import { MapPicker } from "pages/benchmarks-root-level/charts/MapPicker";
import { useList } from "react-use";

export function DownloadOptions({ initialMaps }: { initialMaps: string[] }) {
  const [maps, { set: setMaps }] = useList<string>(initialMaps);
  return (
    <Stack gap={2}>
      <Typography color="text.secondary">
        Bulk export is coming soon.
      </Typography>
      <MapPicker
        sx={{ width: "100%" }}
        value={maps}
        onChange={(e) => setMaps(e.target.value as unknown as string[])}
      />
      <Button color="primary" variant="contained" sx={{ width: "100%" }}>
        Download
      </Button>
    </Stack>
  );
}
