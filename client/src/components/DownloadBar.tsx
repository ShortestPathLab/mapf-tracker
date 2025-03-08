import { DownloadRounded } from "@mui-symbols-material/w400";
import { Button, Fab, Grow, Stack, Typography } from "@mui/material";
import { useBottomBar } from "App";
import { useDialog } from "hooks/useDialog";
import { useTimeout } from "react-use";
import { Scroll } from "./dialog/Scrollbars";
import { useSm } from "./dialog/useSmallDisplay";

export function DownloadOptions() {
  return <></>;
}

export function DownloadBar() {
  const { dialog, open } = useDialog(DownloadOptions, {
    title: "Download dataset",
  });
  const { enabled } = useBottomBar();
  const sm = useSm();
  const [enter] = useTimeout(300);
  return sm ? (
    <>
      <Grow in={enter()}>
        <Fab
          onClick={() => open()}
          variant="extended"
          color="secondary"
          sx={{
            transition: (t) => t.transitions.create("bottom"),
            position: "fixed",
            bottom: enabled ? 80 + 16 : 16,
            right: 16,
            px: 3,
            borderRadius: 2,
          }}
        >
          Download dataset
        </Fab>
      </Grow>
      {dialog}
    </>
  ) : (
    <Stack
      sx={{
        gap: 2,
      }}
    >
      <Typography color="text.secondary" variant="overline" sx={{ mt: -1 }}>
        Download this dataset
      </Typography>
      <Scroll x>
        <Stack
          sx={{
            gap: 1,
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
