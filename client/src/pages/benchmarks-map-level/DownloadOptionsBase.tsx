import {
  Box,
  Button,
  CircularProgress,
  Menu,
  MenuItem,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { BottomBarContext } from "App";
import { FlatCard } from "components/FlatCard";
import { Floating } from "components/Floating";
import { Item } from "components/Item";
import { useSnackbarAction } from "components/Snackbar";
import { Tip } from "components/Tip";
import { appbarHeight } from "components/appbar";
import { GridColDef } from "components/data-grid/DataGrid";
import { Scroll } from "components/dialog/Scrollbars";
import { useMd, useSm, useXs } from "components/dialog/useSmallDisplay";
import Enter from "components/transitions/Enter";
import {
  TreeDataGrid,
  useBooleanMap,
} from "components/tree-data-grid/TreeDataGrid";
import { Map, Scenario } from "core/types";
import { floor, isUndefined, map, noop } from "lodash";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { PopupState as State } from "material-ui-popup-state/hooks";
import { Arrow } from "pages/submission-summary/table/Arrow";
import { ReactNode, useEffect } from "react";
import { paper } from "theme";
import { useStickToBottom } from "use-stick-to-bottom";
import { useBenchmarksAll } from "./DownloadOptions";
import { Job } from "./useBulkMutation";
import { useThrottle } from "react-use";
import { CheckRounded } from "@mui-symbols-material/w400";

export type Models = {
  all: { maps: Models["map"][]; id: string };
  map: Map & { scenarios: Models["scenario"][] };
  scenario: Scenario;
  fallback: { id: string };
};

export type Model = Models[keyof Models];
export function disambiguate<R>(
  m: Model,
  options: {
    [K in keyof Models]?: (m: Models[K]) => R;
  }
) {
  if ("maps" in m) return options?.all?.(m);
  if ("scenarios" in m) return options?.map?.(m);
  if ("instances" in m) return options?.scenario?.(m);
  return options?.fallback?.(m);
}

export function renderPlaceholder() {
  return (
    <Enter in axis="x">
      <Stack direction="row">
        <Box sx={{ width: 64 }} />
        <Item secondary="No items" />
      </Stack>
    </Enter>
  );
}

function arrayFallback<T, U>(s: T[] | undefined, u: U) {
  return s?.length ? s : u;
}
function placeholder(id: string) {
  return [{ id: `${id}-placeholder` }];
}

export function DownloadOptionsBase<
  T extends ReturnType<typeof useBenchmarksAll>["data"][number],
  U extends { label: string }
>({
  rows: data,
  columns,
  onSubmit,
  isLoading,
  isRunning,
  progress,
  summary,
  options,
  selectionMenuItems,
  onRowClick,
  onSelectionMenuItemClick,
  renderLabel,
  jobs: _jobs,
  disabled,
}: {
  onRowClick?: (row: T) => void;
  selectionMenuItems?: U[];
  onSelectionMenuItemClick?: (v: boolean, state: U) => void;
  summary?: ReactNode;
  rows: T[];
  columns: GridColDef<T>[];
  onSubmit?: () => Promise<void>;
  isLoading?: boolean;
  isRunning?: boolean;
  progress?: { current: number; total: number };
  options?: ReactNode;
  renderLabel?: (row: T) => ReactNode;
  jobs?: Job[];
  disabled?: boolean;
}) {
  const jobs = useThrottle(_jobs, 300);

  const notify = useSnackbarAction();
  const theme = useTheme();
  const md = useMd();
  const xs = useXs();
  const sm = useSm();

  const [expanded, setExpanded] = useBooleanMap({ root: true });

  const { scrollRef, contentRef, scrollToBottom } = useStickToBottom();

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom, map(jobs, "id").join(",")]);

  const columns1: GridColDef<T>[] = [
    {
      field: "Icon",
      minWidth: 64,
      width: 64,
      maxWidth: 64,
      renderCell: ({ row }) =>
        disambiguate(row, {
          all: (row) => <Arrow open={expanded[row.id]} />,
          map: (row) => (
            <Arrow
              open={expanded[row.id]}
              sx={{
                translate: (t) => `${t.spacing(2)} 0`,
              }}
            />
          ),
        }),
      flex: 0,
    },
    {
      field: "name",
      headerName: "Resource",
      flex: 1,
      minWidth: 280,
      renderCell: ({ row }) => renderLabel?.(row),
    },
    ...columns,
  ];

  const createMenu = (v: boolean, state: State) => (
    <Menu {...bindMenu(state)}>
      {map(selectionMenuItems, (s, i) => (
        <MenuItem
          key={i}
          onClick={() => {
            onSelectionMenuItemClick?.(v, s);
            state.close();
          }}
        >
          {s.label}
        </MenuItem>
      ))}
    </Menu>
  );

  return (
    <Stack
      gap={2}
      sx={{
        height: `calc(calc(100dvh - ${appbarHeight(md)}px) - ${theme.spacing(
          (xs ? 2 : 3) * 2
        )})`,
      }}
    >
      <Stack direction={sm ? "column" : "row"} sx={{ gap: 2, height: "100%" }}>
        <Stack
          sx={{
            flex: 2,
            width: sm ? "100%" : 0,
            gap: 2,
            height: sm ? 0 : "100%",
          }}
        >
          <Stack
            direction="row"
            sx={{
              gap: 1,
              "> button": {
                px: 2,
                py: 1,
              },
            }}
          >
            <PopupState variant="popover">
              {(s) => (
                <>
                  <Button variant="contained" {...bindTrigger(s)}>
                    Select...
                  </Button>
                  {createMenu(true, s)}
                </>
              )}
            </PopupState>
            <PopupState variant="popover">
              {(s) => (
                <>
                  <Button variant="outlined" {...bindTrigger(s)}>
                    Deselect...
                  </Button>
                  {createMenu(false, s)}
                </>
              )}
            </PopupState>
          </Stack>
          <FlatCard sx={{ flex: 1, overflow: "hidden", mt: 0 }}>
            <Scroll y style={{ height: "100%" }}>
              <BottomBarContext.Provider
                value={{ enabled: false, setEnabled: noop }}
              >
                <TreeDataGrid
                  clickable
                  isLoading={isLoading}
                  columns={columns1}
                  getChildren={(row) =>
                    disambiguate(row, {
                      all: (r) => arrayFallback(r.maps, placeholder(r.id)),
                      map: (r) => arrayFallback(r.scenarios, placeholder(r.id)),
                      scenario: () => undefined,
                    })
                  }
                  expanded={expanded}
                  onExpandedChange={setExpanded}
                  onRowClick={({ row }) => onRowClick?.(row)}
                  rows={data}
                />
              </BottomBarContext.Provider>
              <Box sx={{ height: 64 }} />
            </Scroll>
          </FlatCard>
        </Stack>
        <Stack
          sx={{
            flex: 1,
            minWidth: 320,
            overflow: sm ? "visible" : "hidden",
            justifyContent: "flex-end",
            width: sm ? "100%" : 0,
            height: "100%",
          }}
        >
          <Scroll y>
            <Stack
              sx={{
                minHeight: "100%",
                gap: 2,
                justifyContent: "flex-end",
                "> *": {
                  transition: (t) => t.transitions.create("height"),
                },
              }}
            >
              {!sm && (
                <Tip
                  title="Bulk export"
                  description="Export a large quantity of data at once."
                  actions={
                    <Button
                      onClick={() => open("/docs/solution-format", "_blank")}
                    >
                      Data format reference
                    </Button>
                  }
                />
              )}
              <Stack
                sx={{
                  ...paper(0),
                  maxHeight: sm ? "30dvh" : undefined,
                  height: "fit-content",
                  flex: 1,
                  flexGrow: 0,
                }}
              >
                <Scroll y>
                  <Stack sx={{ p: 2, gap: 2 }}>
                    <Stack>
                      <Typography variant="h5" sx={{ mb: 1 }}>
                        Export options
                      </Typography>
                      {options}
                    </Stack>
                    <Stack>
                      <Typography variant="h5" sx={{ mb: 1 }}>
                        Selection summary
                      </Typography>
                      {summary}
                    </Stack>
                  </Stack>
                </Scroll>
              </Stack>

              {!!jobs?.length && !sm && (
                <Stack
                  sx={{ ...paper(0), maxHeight: "30dvh", height: 120, flex: 1 }}
                >
                  <Scroll y ref={scrollRef}>
                    <Stack
                      ref={contentRef}
                      direction="column-reverse"
                      sx={{ p: 2, gap: 1 }}
                    >
                      {jobs
                        .slice(-20)
                        .reverse()
                        .map(({ id, label, status, progress }) => (
                          <Enter in axis="x" key={id}>
                            <Stack
                              direction="row"
                              sx={{ gap: 2, alignItems: "center" }}
                            >
                              {progress === 1 ? (
                                <CheckRounded color="success" />
                              ) : (
                                <Stack
                                  sx={{
                                    width: 24,
                                    height: 24,
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <CircularProgress
                                    size={20}
                                    sx={{
                                      "& circle": {
                                        strokeWidth: 4,
                                      },
                                      color: status
                                        ?.toLocaleLowerCase()
                                        ?.includes?.("error")
                                        ? "error.main"
                                        : "text.secondary",
                                    }}
                                    variant={
                                      isUndefined(progress)
                                        ? "indeterminate"
                                        : "determinate"
                                    }
                                    value={progress * 100}
                                  />
                                </Stack>
                              )}
                              <Stack>
                                <Typography variant="body2">{label}</Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {status}
                                </Typography>
                              </Stack>
                            </Stack>
                          </Enter>
                        ))}
                    </Stack>
                  </Scroll>
                </Stack>
              )}
              <Floating>
                <Button
                  fullWidth
                  color="secondary"
                  variant="contained"
                  sx={{ width: "100%" }}
                  disabled={isRunning || disabled}
                  onClick={notify(() => onSubmit?.(), {
                    start: "Exporting selection",
                    end: "Exported selection",
                  })}
                >
                  {isRunning
                    ? `Exporting ${floor(progress.current)} of ${
                        progress.total
                      }`
                    : "Export selection"}
                </Button>
              </Floating>
            </Stack>
          </Scroll>
        </Stack>
      </Stack>
    </Stack>
  );
}
