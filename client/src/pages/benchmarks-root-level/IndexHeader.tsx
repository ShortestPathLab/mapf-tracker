import { RouteOutlined } from "@mui-symbols-material/w400";
import {
  ButtonBase,
  Collapse,
  CollapseProps,
  Stack,
  Typography,
} from "@mui/material";
import { useSm } from "components/dialog/useSmallDisplay";

export function IndexHeader(props: CollapseProps) {
  const sm = useSm();
  return (
    <Collapse {...props} sx={{ mb: -4 }}>
      <Stack
        sx={{
          gap: 2,
          pb: sm ? 2 : 3,
          maxWidth: "90vw",
          display: location.pathname === "/visualization" ? "none" : "",
        }}
      >
        <Stack sx={{ mb: 2 }} direction="row" alignItems="center" gap={1}>
          <ButtonBase
            onClick={() => window.open("https://pathfinding.ai")}
            sx={{
              bgcolor: (t) => t.palette.action.hover,
              px: 1,
              py: 0.5,
              borderRadius: 1,
            }}
          >
            <Typography sx={{ fontWeight: 500 }}>ShortestPathLab</Typography>
          </ButtonBase>
          /
          <Stack direction="row" gap={1} alignItems="center">
            <RouteOutlined fontSize="small" />
            <Typography sx={{ fontWeight: 500 }}>MAPF Tracker</Typography>
          </Stack>
        </Stack>
        <Typography variant="h1">
          Tracking Progress in Multi-Agent Pathfinding
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          A database for benchmark results in Multi-Agent Pathfinding (MAPF)
        </Typography>
      </Stack>
    </Collapse>
  );
}
