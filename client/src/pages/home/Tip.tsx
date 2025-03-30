import {
  BookRounded,
  TableRounded,
  UploadRounded,
} from "@mui-symbols-material/w400";
import { alpha, Button, Stack, Typography } from "@mui/material";
import { Scroll } from "components/dialog/Scrollbars";
import { useSm, useXs } from "components/dialog/useSmallDisplay";
import { appName } from "core/config";
import { useNavigate } from "hooks/useNavigation";

export function Tip() {
  const xs = useXs();
  const sm = useSm();
  const navigate = useNavigate();
  return (
    <Stack
      sx={{
        bgcolor: (t) => alpha(t.palette.background.default, 0),
        gap: xs ? 3 : sm ? 3 : 4,
        py: xs ? 2 : 0,
      }}
    >
      <Stack sx={{ gap: 1 }}>
        <Typography variant={xs ? "h2" : "h2"}>{appName}</Typography>
        <Typography
          variant="subtitle1"
          color="text.secondary"
          sx={{
            lineHeight: "1.25",
            mt: -0.5,
          }}
        >
          Tracking the state-of-the-art of multi-agent pathfinding algorithms
        </Typography>
      </Stack>
      {!xs && (
        <Typography variant="body2" sx={{ maxWidth: 840 }}>
          Welcome to {appName} – a comprehensive database for tracking
          state-of-the-art multi-agent pathfinding solutions across a range of
          grid-based benchmarks. Easily monitor advancements, share your
          research, and compare the performance of different algorithms.
        </Typography>
      )}
      <Scroll x fadeX style={{ marginTop: -8, marginBottom: -8 }}>
        <Stack
          direction="row"
          sx={{
            gap: 1,
            py: 1,
            "> button": {
              minWidth: "max-content",
              alignSelf: "flex-start",
              py: 1,
              px: 2,
            },
          }}
        >
          <Button
            startIcon={<TableRounded />}
            onClick={() => navigate("/benchmarks")}
            variant="contained"
            sx={{ color: "background.default", bgcolor: "text.primary" }}
          >
            Browse benchmarks
          </Button>
          <Button
            startIcon={<UploadRounded />}
            variant="outlined"
            color="inherit"
            disableElevation
            sx={{ borderColor: (t) => t.palette.divider }}
            onClick={() => navigate("/submit")}
          >
            Submit results from your algorithm
          </Button>
          <Button
            startIcon={<BookRounded />}
            variant="outlined"
            disableElevation
            color="inherit"
            sx={{ borderColor: (t) => t.palette.divider }}
            onClick={() => navigate("/docs")}
          >
            Read the docs
          </Button>
        </Stack>
      </Scroll>
    </Stack>
  );
}
