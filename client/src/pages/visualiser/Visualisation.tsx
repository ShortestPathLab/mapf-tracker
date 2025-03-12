import {
  BlurOffRounded,
  ChevronLeftRounded,
  ChevronRightRounded,
  CloseRounded,
  PauseRounded,
  PlayArrowRounded,
  ReplayRounded,
} from "@mui-symbols-material/w400";
import {
  Box,
  Card,
  CircularProgress,
  Divider,
  Fade,
  IconButton,
  Slider,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { Container, Graphics, Stage } from "@pixi/react";
import { Dot } from "components/Dot";
import { Item } from "components/Item";
import { Bar } from "components/data-grid";
import { useSm } from "components/dialog/useSmallDisplay";
import Enter from "components/transitions/Enter";
import {
  capitalize,
  filter,
  find,
  findIndex,
  floor,
  isUndefined,
  map,
  mapValues,
  zip,
} from "lodash";
import { Viewport as PixiViewport } from "pixi-viewport";
import { FederatedPointerEvent, Rectangle } from "pixi.js";
import pluralize from "pluralize";
import {
  Reducer,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import AutoSize from "react-virtualized-auto-sizer";
import { paper } from "theme";
import { colors } from "utils/colors";
import { lerp, lerpCircle, useLerp } from "utils/useLerp";
import { Diagnostic } from "./Diagnostic";
import Viewport from "./Viewport";
import { BLACK, SCALE_SHOW_GRID_THRESHOLD, WHITE } from "./constants";
import {
  $agentDiagnostics,
  $agents,
  $bg,
  $box,
  $grid,
  $map,
  Arrow,
  getAngle,
} from "./draw";
import { proportionOf } from "./proportionOf";
import { usePlayback } from "./usePlayback";
import { useThrottleState } from "./useThrottleState";
import { within } from "./within";

export function Visualisation({
  goals,
  width,
  height,
  timespan,
  getAgentPath,
  getAgentPositions,
  isLoading,
  optimisedMap,
  diagnostics = [
    {
      agents: [44, 94],
      t: 33,
      x: 27,
      y: 3,
      label: "agent-to-agent direct collision",
    },
  ],
}: {
  width?: number;
  height?: number;
  isLoading?: boolean;
  goals?: { x: number; y: number }[];
  timespan?: number;
  getAgentPositions: (t: number) => { x: number; y: number }[];
  getAgentPath: (a: number) => {
    x: number;
    y: number;
    action?: string;
  }[];
  optimisedMap?: { x: number; y: number; width: number; height: number }[];
  diagnostics?: Diagnostic[];
}) {
  "use no memo";
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";
  const sm = useSm();

  // ─────────────────────────────────────────────────────────────────────
  const { step, backwards, forwards, play, pause, paused, restart, seek } =
    usePlayback(timespan);

  const time = useLerp(step);

  type Selection = {
    agent?: number;
    show?: boolean;
  };
  const [selection, setSelection] = useReducer<Reducer<Selection, Selection>>(
    (a, b) => ({ ...a, ...b }),
    {}
  );

  // ─────────────────────────────────────────────────────────────────────
  const getAgentColor = useMemo(() => {
    return (i: number) => colors[i % colors.length]?.[dark ? "300" : "A400"];
  }, [dark]);

  const drawGrid = useMemo(
    () => $grid({ x: width, y: height }, dark ? WHITE : BLACK),
    [width, height, dark]
  );

  const drawBox = useMemo(
    () => $box({ x: width, y: height }, dark ? WHITE : BLACK),
    [width, height, dark]
  );

  const drawAgent = useMemo(
    () =>
      !isUndefined(selection.agent) &&
      $agentDiagnostics(
        getAgentColor(selection.agent),
        getAgentPath?.(selection.agent),
        goals?.[selection.agent],
        diagnostics?.filter?.((x) => x.agents.includes(selection.agent)),
        theme.palette.error.main
      ),
    [
      diagnostics,
      step,
      getAgentColor,
      selection,
      getAgentPath,
      goals,
      dark,
      theme.palette.error.main,
    ]
  );

  const drawMap = useMemo(
    () => $map(optimisedMap, dark ? WHITE : BLACK),
    [optimisedMap, dark]
  );

  const [t0, t1, t2] = [floor(time), floor(time) + 1, floor(time) + 2];
  const dt = time - t0;

  const drawAgents = (bounds?: Rectangle) => {
    const positions = zip(getAgentPositions(t0), getAgentPositions(t1));
    return $agents(
      positions
        .map(([a, b], i) => ({
          x: lerp(a.x, b.x, dt),
          y: lerp(a.y, b.y, dt),
          color: getAgentColor(i),
        }))
        .filter((position) => within(position, bounds))
    );
  };

  // ──────────────────────────────────────────────────────────────────────
  const [viewport, setViewport] = useState<PixiViewport>();
  const [showGrid, setShowGrid] = useState(false);
  const [bounds, setBounds] = useThrottleState<Rectangle>();
  const container = useRef<HTMLDivElement>();

  const updateShowGrid = useCallback(() => {
    if (viewport && width) {
      setBounds(viewport.getVisibleBounds());
      setShowGrid(viewport.scale.x > SCALE_SHOW_GRID_THRESHOLD);
    }
  }, [viewport, width, setShowGrid]);

  useEffect(() => {
    if (viewport) {
      viewport.on("moved", updateShowGrid);
      updateShowGrid();
      return () => void viewport.off("moved", updateShowGrid);
    }
  }, [viewport, updateShowGrid]);

  useEffect(() => {
    if (viewport && width && height) {
      viewport
        .fit(false, width, height)
        .moveCenter(width / 2, height / 2)
        .zoom(10, true);
      updateShowGrid();
    }
  }, [viewport, width, height, updateShowGrid]);

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

  const noVisualisation = !isLoading && !timespan;

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
          <BlurOffRounded />
          <Typography>No solution available</Typography>
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
                          theme.palette.background.paper,
                          size.width,
                          size.height
                        )}
                      />
                      <Viewport {...size} onViewport={setViewport}>
                        <Container>
                          <Graphics draw={drawMap} />
                          {showGrid && <Graphics draw={drawGrid} alpha={0.1} />}
                          <Graphics draw={drawAgents(bounds)} />
                          {showGrid &&
                            zip(
                              getAgentPositions(t0),
                              getAgentPositions(t1),
                              getAgentPositions(t2)
                            ).map(([p0, p1, p2], i) => {
                              const [nextDidMove, prevDidMove] = [
                                p2.x !== p1.x || p2.y !== p1.y,
                                p1.x !== p0.x || p1.y !== p0.y,
                              ];
                              const [nextAngle, prevAngle] = [
                                getAngle(p1 ?? p0, p2 ?? p0),
                                getAngle(p0, p1 ?? p0),
                              ];
                              const position = {
                                x: lerp(p0.x, p1.x, dt),
                                y: lerp(p0.y, p1.y, dt),
                              };
                              return (
                                within(position, bounds) && (
                                  <Arrow
                                    opacity={lerp(
                                      +prevDidMove,
                                      +nextDidMove,
                                      dt
                                    )}
                                    position={position}
                                    color={getAgentColor(i)}
                                    rotation={lerpCircle(
                                      prevDidMove ? prevAngle : nextAngle,
                                      nextDidMove ? nextAngle : prevAngle,
                                      dt
                                    )}
                                    key={i}
                                  />
                                )
                              );
                            })}
                          {selection.show && <Graphics draw={drawAgent} />}
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
                          {step} / {timespan ?? "0"}
                        </Typography>
                        <Divider orientation="vertical" flexItem />
                      </>
                    )}
                    {filter([
                      !sm && {
                        name: "Step back",
                        icon: <ChevronLeftRounded />,
                        action: backwards,
                      },
                      {
                        name: paused ? "Play" : "Pause",
                        icon: paused ? (
                          <PlayArrowRounded sx={{ color: "primary.main" }} />
                        ) : (
                          <PauseRounded sx={{ color: "primary.main" }} />
                        ),
                        action: paused ? play : pause,
                      },
                      !sm && {
                        name: "Step forward",
                        icon: <ChevronRightRounded />,
                        action: forwards,
                      },
                      {
                        name: "Restart",
                        icon: <ReplayRounded />,
                        action: restart,
                        disabled: step === 0,
                      },
                    ]).map(({ name, icon, action, disabled }) => (
                      <Tooltip title={name} key={name} placement="top">
                        <IconButton disabled={disabled} onClick={action}>
                          {icon}
                        </IconButton>
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
                        "& *": { transition: "none !important" },
                        mx: 2,
                        width: 240,
                        flex: 1,
                        ".MuiSlider-rail": {
                          opacity: 1,
                          bgcolor: (t) => alpha(t.palette.primary.main, 0.38),
                          backgroundImage: (t) => {
                            const ts = map(diagnostics, "t")
                              .filter((c) => !isUndefined(c))
                              .map((c) => c / timespan);
                            return `linear-gradient(to right, ${map(
                              ts,
                              (c) =>
                                `transparent ${c * 100 - 0.5}%, ${
                                  t.palette.error.main
                                } ${c * 100 - 0.5}%, ${t.palette.error.main} ${
                                  c * 100 + 0.5
                                }%, transparent ${c * 100 + 0.5}%`
                            ).join(", ")})`;
                          },
                        },
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
                    maxWidth: 260,
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
                          <CloseRounded />
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
                        {(() => {
                          const errors = filter(diagnostics, ({ agents }) =>
                            agents.includes(selection.agent)
                          );
                          return (
                            !!errors?.length && (
                              <Item
                                invert
                                primary={errors.map(({ agents, label, t }) => (
                                  <>
                                    {capitalize(label)}:{" "}
                                    {pluralize("agent", agents.length)}{" "}
                                    {agents.join(", ")} at timestep {t}
                                  </>
                                ))}
                                secondary="Errors"
                              />
                            )
                          );
                        })()}
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
