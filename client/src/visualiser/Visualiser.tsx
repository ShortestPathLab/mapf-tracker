import {
  ChevronLeftOutlined,
  ChevronRightOutlined,
  PauseOutlined,
  PlayArrowOutlined,
} from "@mui/icons-material";
import {
  Box,
  Card,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { Container, Graphics, Stage } from "@pixi/react";
import { capitalize, each, min, range, trim } from "lodash";
import { Graphics as PixiGraphics } from "pixi.js";
import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import AutoSize from "react-virtualized-auto-sizer";
import PageHeader from "../PageHeader";
import Viewport from "./Viewport";
import { colors } from "./colors";
import { usePlayback } from "./usePlayback";
import { useSolution } from "./useSolution";

const LINE_WIDTH = 0.05;
const WHITE = "#ffffff";
const BLACK = "#000000";

function hexToInt(s: string) {
  return parseInt(trim(s, "#"), 16);
}

const $grid =
  ({ x: width, y: height }: { x: number; y: number }, color: string) =>
  (g: PixiGraphics) => {
    g.clear();
    g.lineStyle(LINE_WIDTH, hexToInt(color));
    for (const x of range(width + 1)) {
      g.moveTo(x, 0).lineTo(x, height);
    }
    for (const y of range(height + 1)) {
      g.moveTo(0, y).lineTo(width, y);
    }
  };

const $agents =
  (agents: { color: string; x: number; y: number }[]) => (g: PixiGraphics) => {
    g.clear();
    for (const { x, y, color } of agents) {
      g.beginFill(hexToInt(color)).drawRect(x, y, 1, 1).endFill();
    }
  };

const $map = (map: boolean[][], color: string) => (g: PixiGraphics) => {
  each(map, (row, y) => {
    each(row, (b, x) => {
      if (b) g.beginFill(hexToInt(color)).drawRect(x, y, 1, 1).endFill();
    });
  });
};

export default function Visualiser() {
  const location = useLocation();
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";

  // ─────────────────────────────────────────────────────────────────────

  const { map, result, getAgentPosition } = useSolution({
    solutionKey: location.state.path_id,
    agentCount: location.state.num_agents,
    mapKey: location.state.map_name,
    scenarioKey: location.state.scen_string,
  });

  const { timespan = 0, x = 0, y = 0 } = result ?? {};

  const { step, backwards, forwards, play, pause, paused } =
    usePlayback(timespan);

  // ─────────────────────────────────────────────────────────────────────

  const drawGrid = useMemo(
    () => $grid({ x, y }, dark ? WHITE : BLACK),
    [x, y, theme.palette.mode]
  );

  const drawMap = useMemo(() => $map(map, dark ? WHITE : BLACK), [map, dark]);

  const drawAgents = useMemo(() => {
    const positions = getAgentPosition(step);
    return $agents(
      positions.map(({ x, y }, i) => ({
        x,
        y,
        color: colors[i % colors.length][dark ? "300" : "A100"],
      }))
    );
  }, [getAgentPosition, step, dark]);

  // ─────────────────────────────────────────────────────────────────────

  const scale = (width: number, height: number) =>
    (min([width, height])! / min([x, y])!) * 0.8;

  const offsetX = (w: number, h: number) => (w - scale(w, h) * x) / 2;
  const offsetY = (w: number, h: number) => (h - scale(w, h) * y) / 2;

  const scenarioString = capitalize(
    `${location.state.scenType}-${location.state.scenTypeID}`
  );
  return (
    <Box
      sx={{
        width: "100vw",
        //TODO: actual height
        height: "calc(100vh - 88px)",
        position: "fixed",
        left: 0,
        //TODO: don't hardcode position
        top: 88,
      }}
    >
      <Stack sx={{ position: "fixed", p: 4, top: 88, left: 0 }}>
        <PageHeader
          current="View"
          path={[
            { name: "MAPF Tracker", url: "/" },
            { name: "Benchmarks", url: "/benchmarks" },
            {
              name: capitalize(location.state.map_name),
              url: "/scenarios",
              state: location.state,
            },
            {
              name: scenarioString,
              url: "/instances",
              state: location.state,
            },
          ]}
        />
      </Stack>
      <AutoSize>
        {(size) => (
          <Stage
            key={theme.palette.mode}
            {...size}
            options={{
              backgroundColor: hexToInt(theme.palette.background.default),
              antialias: true,
            }}
          >
            <Viewport {...size} key={`${size.width},${size.height}`}>
              <Container
                scale={scale(size.width, size.height)}
                x={offsetX(size.width, size.height)}
                y={offsetY(size.width, size.height)}
              >
                <Graphics draw={drawAgents} />
                <Graphics draw={drawMap} />
                <Graphics draw={drawGrid} alpha={0.3} />
              </Container>
            </Viewport>
          </Stage>
        )}
      </AutoSize>
      <Stack
        sx={{
          position: "fixed",
          right: 0,
          bottom: 0,
          p: 4,
        }}
      >
        <Card sx={{ py: 1, px: 2 }}>
          <Stack direction="row" sx={{ gap: 2, alignItems: "center" }}>
            <Typography sx={{ px: 2 }}>
              {step} / {timespan}
            </Typography>
            <Divider orientation="vertical" flexItem />
            {[
              {
                name: "Step back",
                icon: <ChevronLeftOutlined />,
                action: backwards,
              },
              {
                name: paused ? "Play" : "Pause",
                icon: paused ? (
                  <PlayArrowOutlined sx={{ color: "primary.main" }} />
                ) : (
                  <PauseOutlined sx={{ color: "primary.main" }} />
                ),
                action: paused ? play : pause,
              },
              {
                name: "Step forwards",
                icon: <ChevronRightOutlined />,
                action: forwards,
              },
            ].map(({ name, icon, action }) => (
              <Tooltip title={name}>
                <IconButton onClick={action}>{icon}</IconButton>
              </Tooltip>
            ))}
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
}
