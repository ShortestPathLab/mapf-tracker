import {
  BookRounded,
  SearchRounded,
  UploadRounded,
} from "@mui-symbols-material/w400";
import { alpha, Button, Stack, Typography } from "@mui/material";
import { useSm } from "components/dialog/useSmallDisplay";
import { appName } from "core/config";
import { useNavigate } from "hooks/useNavigation";
export function Tip() {
  const sm = useSm();
  const navigate = useNavigate();
  return (
    <Stack
      sx={{
        borderRadius: 1,
        p: sm ? 2 : 4,
        bgcolor: (t) => alpha(t.palette.background.default, 1),
        gap: sm ? 2 : 4,
      }}
    >
      <Stack sx={{ gap: 1 }}>
        <Typography variant="h2">{appName}</Typography>
        <Typography variant="subtitle2" color="text.secondary">
          by ShortestPathLab
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ maxWidth: 840 }}>
        Welcome to {appName}. {appName} is a database for keeping track of
        state-of-the-art multi-agent pathfinding solutions on a set of
        grid-based benchmarks. Keep track of the state-of-the-art, share your
        work, and compare your algorithms.
      </Typography>
      <Stack
        direction="row"
        sx={{
          gap: 1,
          flexWrap: "wrap",
          "> button": {
            minWidth: "max-content",
            alignSelf: "flex-start",
            borderRadius: 999,
            py: 1,
            px: 2,
          },
        }}
      >
        <Button
          startIcon={<SearchRounded />}
          onClick={() => navigate("/benchmarks")}
          variant="contained"
        >
          Browse the dataset
        </Button>
        <Button
          startIcon={<UploadRounded />}
          variant="outlined"
          onClick={() => navigate("/submit")}
        >
          Submit results from your algorithm
        </Button>
        <Button
          startIcon={<BookRounded />}
          variant="outlined"
          onClick={() => navigate("/docs")}
        >
          Read the docs
        </Button>
      </Stack>
    </Stack>
  );
}
