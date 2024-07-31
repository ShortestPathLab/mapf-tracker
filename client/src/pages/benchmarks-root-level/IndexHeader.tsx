import { RouteOutlined } from "@mui/icons-material";
import {
  CollapseProps,
  Collapse,
  Stack,
  ButtonBase,
  Typography,
  Divider,
} from "@mui/material";

export function IndexHeader(props: CollapseProps) {
  return (
    <Collapse {...props} sx={{ mb: -4 }}>
      <Stack
        sx={{
          gap: 2,
          pb: 8,
          px: 8,
          maxWidth: 680,
          alignItems: "center",
          textAlign: "center",
          mx: "auto",
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
      <Divider sx={{ mb: 8 }} />
    </Collapse>
  );
}
