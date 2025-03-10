import { DownloadRounded } from "@mui-symbols-material/w400";
import { Box, Button, Fab, Grow, Stack, Typography } from "@mui/material";
import { useBottomBar } from "App";
import { useTimeout } from "react-use";
import { Scroll } from "./dialog/Scrollbars";
import { useSm, useXs } from "./dialog/useSmallDisplay";
import { useSurface } from "./surface";

export function DownloadOptions() {
  return <>Test test</>;
}

export function DownloadBar() {
  "use no memo";
  const { dialog, open } = useSurface(DownloadOptions, {
    title: "Download dataset",
  });
  const { enabled } = useBottomBar();
  const xs = useXs();
  const sm = useSm();
  const [enter] = useTimeout(300);
  return xs ? (
    <>
      <Box
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: (t) => t.zIndex.fab,
          transform: enabled ? "translateY(-80px)" : "translateY(0)",
          transition: (t) => t.transitions.create(["transform"]),
        }}
      >
        <Grow in={enter()}>
          <Fab
            onClick={() => open({})}
            variant="extended"
            color="secondary"
            sx={{
              px: 3,
              borderRadius: 2,
            }}
          >
            Download dataset
          </Fab>
        </Grow>
      </Box>
      {dialog}
    </>
  ) : (
    <Stack
      sx={{
        gap: 2,
      }}
    >
      {!sm && (
        <Typography color="text.secondary" variant="overline" sx={{ mt: -1 }}>
          Download this dataset
        </Typography>
      )}
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
