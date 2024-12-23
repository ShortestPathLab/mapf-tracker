import {
  BlurOffOutlined,
  ChevronLeftOutlined,
  ChevronRightOutlined,
  CloseOutlined,
  FirstPageOutlined,
  PauseOutlined,
  PlayArrowOutlined,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  Fade,
  IconButton,
  Slider,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { Container, Graphics, Stage } from "@pixi/react";
import { Dot } from "components/Dot";
import { Item } from "components/Item";
import { Bar } from "components/data-grid";
import { useSm } from "components/dialog/useSmallDisplay";
import Enter from "components/transitions/Enter";
import { useLocationState } from "hooks/useNavigation";
import {
  each,
  find,
  findIndex,
  first,
  floor,
  head,
  isUndefined,
  mapValues,
  range,
  trim,
  zip,
} from "lodash";
import memoizee from "memoizee";
import { Viewport as PixiViewport } from "pixi-viewport";
import { FederatedPointerEvent, Graphics as PixiGraphics } from "pixi.js";
import {
  Reducer,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import AutoSize from "react-virtualized-auto-sizer";
import { paper } from "theme";
import { colors } from "utils/colors";
import { lerp, lerpCircle, useLerp } from "utils/useLerp";
import Viewport from "./Viewport";
import { VisualiserLocationState } from "./VisualiserLocationState";
import { usePlayback } from "./usePlayback";
import { useSolution } from "./useSolution";

const SCALE_SHOW_GRID_THRESHOLD = 20;

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
      g.beginFill(hexToInt(color))
        .drawCircle(x + 0.5, y + 0.5, 0.5)
        .endFill();
    }
  };

const $map = (map: boolean[][], color: string) => (g: PixiGraphics) => {
  each(map, (row, y) => {
    each(row, (b, x) => {
      if (b) g.beginFill(hexToInt(color), 0.85).drawRect(x, y, 1, 1).endFill();
    });
  });
};

const $agentDiagnostics = memoizee(
  (
      color: string,
      path: { x: number; y: number }[],
      goal: { x: number; y: number }
    ) =>
    (g: PixiGraphics) => {
      g.clear();
      g.lineStyle(LINE_WIDTH, hexToInt(color));
      g.moveTo(head(path).x + 0.5, head(path).y + 0.5);
      each(path, (point) => {
        g.lineTo(point.x + 0.5, point.y + 0.5);
      });
      g.drawCircle(first(path).x + 0.5, first(path).y + 0.5, 0.5);
      g.drawCircle(goal.x + 0.5, goal.y + 0.5, 0.5);
    },
  { normalizer: JSON.stringify }
);

const $bg = memoizee(
  (color, width, height): ((graphics: PixiGraphics) => void) =>
    (g) =>
      g.beginFill(hexToInt(color)).drawRect(0, 0, width, height).endFill()
);

export default function () {
  const state = useLocationState<VisualiserLocationState>();
  return (
    <Visualisation
      instanceId={state.instanceId}
      solutionId={state.solutionId}
      source={state.source}
    />
  );
}

const $pointer = memoizee((color: string) => (g: PixiGraphics) => {
  return g
    .beginFill(hexToInt(color))
    .drawPolygon(-0.12, -0.7, 0.12, -0.7, 0, -0.8)
    .endFill();
});

export function Arrow({
  position,
  color,
  rotation,
  opacity,
}: {
  opacity: number;
  position: { x: number; y: number };
  color: string;
  rotation: number;
}) {
  return (
    <Graphics
      alpha={opacity}
      x={position.x + 0.5}
      y={position.y + 0.5}
      draw={$pointer(color)}
      rotation={rotation + Math.PI / 2}
    />
  );
}

const getAngle = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.atan2(b.y - a.y, b.x - a.x);

export function Visualisation({
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
  const navigate = useNavigate();

  // ─────────────────────────────────────────────────────────────────────

  const { map, result, getAgentPositions, getAgentPath, isLoading } =
    useSolution({
      instanceId,
      solutionId,
      source,
    });

  const { timespan = 0, x = 0, y = 0, goals } = result ?? {};

  const { step, backwards, forwards, play, pause, paused, restart, seek } =
    usePlayback(timespan);

  const time = useLerp(step);

  type P = {
    agent?: number;
    show?: boolean;
  };
  const [selection, setSelection] = useReducer<Reducer<P, P>>(
    (a, b) => ({ ...a, ...b }),
    {}
  );

  // ─────────────────────────────────────────────────────────────────────

  const getAgentColor = useMemo(() => {
    return (i: number) => colors[i % colors.length]?.[dark ? "300" : "A400"];
  }, [dark]);

  const drawGrid = useMemo(
    () => $grid({ x, y }, dark ? WHITE : BLACK),
    [x, y, dark]
  );

  const drawBox = useMemo(
    () => $box({ x, y }, dark ? WHITE : BLACK),
    [x, y, dark]
  );

  const drawAgent = useMemo(
    () =>
      !isUndefined(selection.agent) &&
      $agentDiagnostics(
        getAgentColor(selection.agent),
        getAgentPath?.(selection.agent),
        goals?.[selection.agent]
      ),
    [step, getAgentColor, selection, getAgentPath, goals]
  );

  const drawMap = useMemo(() => $map(map, dark ? WHITE : BLACK), [map, dark]);

  const [a, b, c] = [floor(time), floor(time) + 1, floor(time) + 2];
  const t = time - a;
  const drawAgents = useMemo(() => {
    const positions = zip(getAgentPositions(a), getAgentPositions(b));
    return $agents(
      positions.map(([a, b], i) => ({
        x: lerp(a.x, b.x, t),
        y: lerp(a.y, b.y, t),
        color: getAgentColor(i),
      }))
    );
  }, [a, b, t, getAgentPositions, getAgentColor, dark]);

  // ──────────────────────────────────────────────────────────────────────

  const [viewport, setViewport] = useState<PixiViewport>();
  const [showGrid, setShowGrid] = useState(false);
  const container = useRef<HTMLDivElement>();

  const updateShowGrid = useCallback(() => {
    if (viewport && x) {
      setShowGrid(viewport.scale.x > SCALE_SHOW_GRID_THRESHOLD);
    }
  }, [viewport, x, setShowGrid]);

  useEffect(() => {
    if (viewport) {
      viewport.on("moved", updateShowGrid);
      updateShowGrid();
      return () => void viewport.off("moved", updateShowGrid);
    }
  }, [viewport, updateShowGrid]);

  useEffect(() => {
    if (viewport && x && y) {
      viewport.fit(false, x, y);
      viewport.moveCenter(x / 2, y / 2);
      viewport.zoom(10, true);
      updateShowGrid();
    }
  }, [viewport, x, y, updateShowGrid]);

  useEffect(() => {
    if (viewport && container.current) {
      const f = (e: FederatedPointerEvent) => {
        const position = mapValues(viewport.toWorld(e.screen), (x) => floor(x));
        const agent = find(
          getAgentPositions(step),
          (a) => a.x === position.x && a.y === position.y
        );
        container.current.style.cursor = agent ? "pointer" : "default";
      };
      viewport.on("mousemove", f);
      return () => void viewport.off("mousemove", f);
    }
  }, [viewport, step, getAgentPositions, container.current]);

  useEffect(() => {
    if (viewport) {
      const f = (e: { world: { x: number; y: number } }) => {
        const position = mapValues(e.world, (x) => floor(x));
        const agent = findIndex(
          getAgentPositions(step),
          (a) => a.x === position.x && a.y === position.y
        );
        if (agent === -1) return;
        setSelection({ agent, show: true });
      };
      viewport.on("clicked", f);
      return () => void viewport.off("clicked", f);
    }
  }, [viewport, getAgentPositions, step, setSelection]);

  const noVisualisation = !isLoading && !result;

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        position: "absolute",
      }}
    >
      {noVisualisation ? (
        <Stack
          sx={{
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            gap: 2,
          }}
        >
          <BlurOffOutlined />
          <Typography>No solution available</Typography>
          <Button
            variant="contained"
            sx={{ py: 1, px: 2, mt: 2 }}
            onClick={() => navigate(-1)}
          >
            Go back
          </Button>
        </Stack>
      ) : (
        <AutoSize>
          {(size) => (
            <>
              {isLoading ? (
                <Stack
                  sx={{
                    ...size,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CircularProgress />
                </Stack>
              ) : (
                <Fade
                  in
                  style={{
                    transitionDelay: "300ms",
                  }}
                  key={`${size.width},${size.height}`}
                >
                  <Box ref={container} sx={size}>
                    <Stage
                      {...size}
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
                      <Viewport {...size} onViewport={setViewport}>
                        <Container>
                          <Graphics draw={drawMap} />
                          {showGrid && <Graphics draw={drawGrid} alpha={0.1} />}
                          <Graphics draw={drawAgents} />
                          {selection.show && <Graphics draw={drawAgent} />}
                          {zip(
                            getAgentPositions(a),
                            getAgentPositions(b),
                            getAgentPositions(c)
                          ).map(([current, next, next2], i) => {
                            const [nextDidMove, prevDidMove] = [
                              next2.x !== next.x || next2.y !== next.y,
                              next.x !== current.x || next.y !== current.y,
                            ];
                            const [nextAngle, prevAngle] = [
                              getAngle(next ?? current, next2 ?? current),
                              getAngle(current, next ?? current),
                            ];
                            return (
                              <Arrow
                                opacity={lerp(+prevDidMove, +nextDidMove, t)}
                                position={{
                                  x: lerp(current.x, next.x, t),
                                  y: lerp(current.y, next.y, t),
                                }}
                                color={getAgentColor(i)}
                                rotation={lerpCircle(
                                  prevDidMove ? prevAngle : nextAngle,
                                  nextDidMove ? nextAngle : prevAngle,
                                  t
                                )}
                                key={i}
                              />
                            );
                          })}
                          <Graphics draw={drawBox} alpha={0.1} />
                        </Container>
                      </Viewport>
                    </Stage>
                  </Box>
                </Fade>
              )}
              <Stack
                sx={{
                  position: "absolute",
                  right: 0,
                  bottom: 0,
                  maxWidth: "100%",
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
                    <Divider orientation="vertical" flexItem />
                    <Slider
                      value={step}
                      onChange={(_, n) => seek(+n)}
                      min={0}
                      max={timespan}
                      step={1}
                      sx={{
                        mx: 2,
                        width: 240,
                        flex: 1,
                      }}
                    />
                  </Stack>
                </Card>
              </Stack>
              <Enter in={selection.show} axis="X" key={selection.agent}>
                <Stack
                  sx={{
                    ...paper(1),
                    position: "absolute",
                    top: 0,
                    right: 0,
                    m: sm ? 2 : 3,
                  }}
                >
                  {!isUndefined(selection.agent) && (
                    <>
                      <Stack
                        direction="row"
                        sx={{
                          alignItems: "center",
                          py: 0.5,
                          px: 2,
                          gap: 4,
                        }}
                      >
                        <Typography sx={{ flex: 1 }}>
                          <Dot
                            sx={{ bgcolor: getAgentColor(selection.agent) }}
                          />
                          Agent {selection.agent}
                        </Typography>
                        <IconButton
                          edge="end"
                          onClick={() => setSelection({ show: false })}
                        >
                          <CloseOutlined />
                        </IconButton>
                      </Stack>
                      <Stack sx={{ p: 2, minWidth: 180 }}>
                        <Item
                          invert
                          primary={getAgentPath(selection.agent).length - 1}
                          secondary="Cost"
                        />
                        {[
                          {
                            name: "Moving",
                            value: proportionOf(
                              getAgentPath(selection.agent),
                              (p) => p.action !== "w"
                            ),
                          },
                          {
                            name: "Waiting",
                            value: proportionOf(
                              getAgentPath(selection.agent),
                              (p) => p.action === "w"
                            ),
                          },
                        ].map(({ name, value }) => (
                          <Item
                            invert
                            key={name}
                            primary={
                              <Bar
                                values={[
                                  {
                                    label: name,
                                    value: value,
                                    color: getAgentColor(selection.agent),
                                  },
                                ]}
                              />
                            }
                            secondary={name}
                          />
                        ))}
                      </Stack>
                    </>
                  )}
                </Stack>
              </Enter>
            </>
          )}
        </AutoSize>
      )}
    </Box>
  );
}

function proportionOf<T>(xs: T[], f: (x: T) => boolean): number {
  return xs.filter(f).length / xs.length;
}
