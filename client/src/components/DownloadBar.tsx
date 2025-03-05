import { DownloadRounded } from "@mui-symbols-material/w400";
import { Stack, Typography, Button } from "@mui/material";
import { useSm } from "./dialog/useSmallDisplay";
import { Scroll } from "./dialog/Scrollbars";

export function DownloadBar() {
  const sm = useSm();
  return (
    <Stack sx={{ gap: 2 }}>
      {!sm && (
        <Typography color="text.secondary" variant="subtitle2">
          Download this dataset
        </Typography>
      )}
      <Scroll x>
        <Stack
          sx={{
            gap: 1,
            flexWrap: "wrap",
            "> button": {
              borderRadius: 999,
              py: 1,
              px: 2,
              minWidth: "max-content",
            },
          }}
          direction="row"
        >
          <Button variant="contained" startIcon={<DownloadRounded />}>
            All instances
          </Button>
          <Button variant="outlined" startIcon={<DownloadRounded />}>
            Map
          </Button>
          <Button variant="outlined" startIcon={<DownloadRounded />}>
            Results (CSV)
          </Button>
        </Stack>
      </Scroll>
    </Stack>
  );
}
