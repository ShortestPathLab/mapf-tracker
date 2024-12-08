import {
  ChevronLeftOutlined,
  ChevronRightOutlined,
  FirstPageOutlined,
  PauseOutlined,
  PlayArrowOutlined,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { Container, Graphics, Stage } from "@pixi/react";
import { useSm } from "components/dialog/useSmallDisplay";
import { useLocationState } from "hooks/useNavigation";
import { each, min, range, trim } from "lodash";
import memoizee from "memoizee";
import { Viewport as PixiViewport } from "pixi-viewport";
import { Graphics as PixiGraphics } from "pixi.js";
import { useEffect, useMemo, useRef, useState } from "react";
import AutoSize from "react-virtualized-auto-sizer";
import { paper } from "theme";
import { colors } from "utils/colors";
import Viewport from "./Viewport";
import { VisualiserLocationState } from "./VisualiserLocationState";
import { usePlayback } from "./usePlayback";
import { useSolution } from "./useSolution";

const SCALE_SHOW_GRID_THRESHOLD = 30;

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

const $box =
  ({ x: width, y: height }: { x: number; y: number }, color: string) =>
  (g: PixiGraphics) => {
    g.clear();
    g.lineStyle(LINE_WIDTH, hexToInt(color));
    g.moveTo(0, 0)
      .lineTo(0, height)
      .lineTo(width, height)
      .lineTo(width, 0)
      .lineTo(0, 0);
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

const $bg = memoizee(
  (color, width, height): ((graphics: PixiGraphics) => void) =>
    (g) =>
      g.beginFill(hexToInt(color)).drawRect(0, 0, width, height).endFill()
);

export default function () {
  const state = useLocationState<VisualiserLocationState>();
  return (
    <Visualiser1
      instanceId={state.instanceId}
      solutionId={state.solutionId}
      source={state.source}
    />
  );
}

export function Visualiser1({
  instanceId,
  solutionId,
  source,
}: {
  instanceId?: string;
  solutionId?: string;
  source?: "ongoing" | "submitted";
}) {
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";
  const sm = useSm();

  // ─────────────────────────────────────────────────────────────────────

  const { map, result, getAgentPosition, isLoading } = useSolution({
    instanceId,
    solutionId,
    source,
  });

  const { timespan = 0, x = 0, y = 0 } = result ?? {};

  const { step, backwards, forwards, play, pause, paused, restart } =
    usePlayback(timespan);

  // ─────────────────────────────────────────────────────────────────────

  const drawGrid = useMemo(
    () => $grid({ x, y }, dark ? WHITE : BLACK),
    [x, y, dark]
  );

  const drawBox = useMemo(
    () => $box({ x, y }, dark ? WHITE : BLACK),
    [x, y, dark]
  );

  const drawMap = useMemo(() => $map(map, dark ? WHITE : BLACK), [map, dark]);

  const drawAgents = useMemo(() => {
    const positions = getAgentPosition(step);
    return $agents(
      positions.map(({ x, y }, i) => ({
        x,
        y,
        color: colors[i % colors.length][dark ? "300" : "A400"],
      }))
    );
  }, [getAgentPosition, step, dark]);

  // ─────────────────────────────────────────────────────────────────────

  const scale = (width: number, height: number) =>
    (min([width, height])! / min([x, y])!) * 0.7;

  const offsetX = (w: number, h: number) => (w - scale(w, h) * x) / 2;
  const offsetY = (w: number, h: number) => (h - scale(w, h) * y) / 2;

  // ──────────────────────────────────────────────────────────────────────

  const viewport = useRef<PixiViewport | null>(null);
  const [showGrid, setShowGrid] = useState(false);

  useEffect(() => {
    if (!viewport.current || !x) return;
    const f = () => {
      setShowGrid(
        scale(viewport.current.screenWidth, viewport.current.screenHeight) *
          viewport.current.scale.x >
          SCALE_SHOW_GRID_THRESHOLD
      );
    };
    viewport.current.on("moved", f);
    f();
    return () => void viewport.current.off("moved", f);
  }, [viewport.current, x, setShowGrid]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        position: "absolute",
      }}
    >
      <AutoSize>
        {(size) => (
          <>
            {isLoading ? (
              <Stack
                sx={{ ...size, alignItems: "center", justifyContent: "center" }}
              >
                <CircularProgress />
              </Stack>
            ) : (
              <Stage
                {...size}
                renderOnComponentChange
                options={{
                  antialias: true,
                  powerPreference: "high-performance",
                }}
              >
                <Graphics
                  draw={$bg(
                    theme.palette.background.default,
                    size.width,
                    size.height
                  )}
                />
                <Viewport
                  {...size}
                  key={`${size.width},${size.height}`}
                  ref={viewport}
                >
                  <Container
                    scale={scale(size.width, size.height)}
                    x={offsetX(size.width, size.height)}
                    y={offsetY(size.width, size.height)}
                  >
                    <Graphics draw={drawAgents} />
                    <Graphics draw={drawMap} />
                    {showGrid && <Graphics draw={drawGrid} alpha={0.1} />}
                    <Graphics draw={drawBox} alpha={0.1} />
                  </Container>
                </Viewport>
              </Stage>
            )}
            <Stack
              sx={{
                position: "absolute",
                right: 0,
                bottom: 0,
                // p: 4,
              }}
            >
              <Card sx={{ py: 1, m: sm ? 2 : 3, px: 2, ...paper() }}>
                <Stack direction="row" sx={{ gap: 2, alignItems: "center" }}>
                  {!sm && (
                    <>
                      <Typography sx={{ px: 2 }}>
                        {step} / {timespan}
                      </Typography>
                      <Divider orientation="vertical" flexItem />
                    </>
                  )}
                  {[
                    {
                      name: "Restart",
                      icon: <FirstPageOutlined />,
                      action: restart,
                    },
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
                      name: "Step forward",
                      icon: <ChevronRightOutlined />,
                      action: forwards,
                    },
                  ].map(({ name, icon, action }) => (
                    <Tooltip title={name} key={name}>
                      <IconButton onClick={action}>{icon}</IconButton>
                    </Tooltip>
                  ))}
                </Stack>
              </Card>
            </Stack>
          </>
        )}
      </AutoSize>
    </Box>
  );
}
