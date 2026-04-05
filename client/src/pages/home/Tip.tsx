import {
  BookRounded,
  TableRounded,
  UploadRounded,
} from "@mui-symbols-material/w300";
import { Box, Button, Stack, ThemeProvider, Typography } from "@mui/material";
import { Scroll } from "components/dialog/Scrollbars";
import { useSm, useXs } from "components/dialog/useSmallDisplay";
import { appName } from "core/config";
import { useNavigate } from "hooks/useNavigation";
import { darkTheme, paper } from "theme";

export function Tip() {
  const xs = useXs();
  const sm = useSm();
  const navigate = useNavigate();
  return (
    <Stack
      sx={{
        gap: xs ? 3 : sm ? 3 : 4,
        p: xs ? 4 : 6,
        textWrap: "balance",
        borderRadius: 1,
        position: 'relative',
        overflow: 'hidden',
        "> *": { zIndex: 1 },
        border: (t) => `1px solid ${t.palette.divider}`,
        // backgroundImage: (t) =>
        //   `linear-gradient(to bottom, ${t.palette.secondary.main}20, transparent)`,
      }}
    >
      <Box sx={{
        position: 'absolute',
        inset: 0,
        backgroundImage: t => `linear-gradient(to bottom, ${t.palette.background.default}, ${t.palette.background.default}), url(/assets/6.png)`,
        backgroundSize: '100% 100%',
        backgroundBlendMode: 'lighten, normal',
        zIndex: 0,
        opacity: 0.3,
      }} />
      <Stack sx={{ gap: 1 }}>
        <Typography
          variant={xs ? "h2" : "h1"}
          sx={{ fontWeight: xs ? 400 : 300, fontSize: xs ? '1.5rem' : "2.5rem" }}
        >
          {appName}
        </Typography>
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
            color="secondary"
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
