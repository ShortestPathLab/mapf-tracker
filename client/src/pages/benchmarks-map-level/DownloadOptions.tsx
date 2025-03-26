import {
  Box,
  Button,
  Checkbox,
  Menu,
  MenuItem,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {
  useMutation,
  UseMutationResult,
  useQueries,
} from "@tanstack/react-query";
import { BlobWriter, TextReader, ZipWriter } from "@zip.js/zip.js";
import { BottomBarContext, queryClient } from "App";
import byteSize from "byte-size";
import { CheckboxItem } from "components/analysis/ChartOptions";
import { appbarHeight } from "components/appbar";
import { GridColDef } from "components/data-grid/DataGrid";
import { Scroll } from "components/dialog/Scrollbars";
import { useMd, useSm, useXs } from "components/dialog/useSmallDisplay";
import { FlatCard } from "components/FlatCard";
import { Floating } from "components/Floating";
import { Item } from "components/Item";
import { useSnackbarAction } from "components/Snackbar";
import { Tip } from "components/Tip";
import Enter from "components/transitions/Enter";
import {
  TreeDataGrid,
  useBooleanMap,
} from "components/tree-data-grid/TreeDataGrid";
import { APIConfig } from "core/config";
import { Benchmark, InstanceCollection } from "core/types";
import download from "downloadjs";
import { json2csv } from "json-2-csv";
import {
  chain,
  entries,
  every,
  flatMap,
  floor,
  isEqual,
  keyBy,
  map,
  noop,
  some,
  startCase,
  thru,
  zip,
} from "lodash";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { PopupState as State } from "material-ui-popup-state/hooks";
import { Arrow } from "pages/submission-summary/table/Arrow";
import { MapLabel } from "pages/submission-summary/table/MapLabel";
import { ScenarioLabel } from "pages/submission-summary/table/ScenarioLabel";
import pluralize from "pluralize";
import { parallel, series } from "promise-tools";
import { post } from "queries/mutation";
import { text, toJson } from "queries/query";
import {
  instanceScenarioQuery,
  useBenchmarksData,
} from "queries/useBenchmarksQuery";
import {
  createContext,
  MouseEvent,
  PropsWithChildren,
  TouchEvent,
  useContext,
  useMemo,
  useState,
} from "react";
import { useList } from "react-use";
import { paper } from "theme";

type Models = {
  all: { all: Models["map"][]; id: string };
  map: Benchmark & { scenarios: Models["scenario"][] };
  scenario: InstanceCollection;
  fallback: { id: string };
};
export type Model = Models[keyof Models];
export function disambiguate<R>(
  m: Model,
  options: {
    [K in keyof Models]?: (m: Models[K]) => R;
  }
) {
  if ("all" in m) return options?.all?.(m);
  if ("scenarios" in m) return options?.map?.(m);
  if ("scen_type" in m) return options?.scenario?.(m);
  return options?.fallback?.(m);
}

function renderPlaceholder() {
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

function useBenchmarksAll() {
  const { data: maps, isLoading: isMapLoading } = useBenchmarksData();
  const { data, isLoading } = useQueries({
    queries: maps?.map?.((m) => instanceScenarioQuery(m.id)) ?? [],
    combine: (result) => ({
      isLoading: some(result, "isLoading"),
      data: zip(maps, map(result, "data"))?.map?.(([map, data]) => ({
        ...map,
        scenarios: data,
      })),
    }),
  });
  return {
    data: [{ all: data, id: "root" }],
    isLoading: isLoading || isMapLoading,
  };
}

function useSet<T>(initial?: T[]) {
  const [state, set] = useList(initial);
  const index = useMemo(() => new Set(state), [state]);
  const ops = {
    value: state,
    ...set,
    count: state.length,
    has: (t: T) => index.has(t),
    add: (...xs: T[]) => xs.forEach((x) => set.upsert(isEqual, x)),
    remove: (...xs: T[]) => set.filter((x) => !xs.includes(x)),
    toggle: (v: boolean, ...xs: T[]) =>
      v ? ops.add(...xs) : ops.remove(...xs),
    bindToggle: (...xs: T[]) => {
      const checked = {
        every: every(xs, (x) => ops.has(x)),
        some: some(xs, (x) => ops.has(x)),
      };
      return {
        checked: checked.every,
        indeterminate: checked.some && !checked.every,
        onMouseDown: (e: MouseEvent<unknown>) => e.stopPropagation(),
        onTouchStart: (e: TouchEvent<unknown>) => e.stopPropagation(),
        onClick: (e: MouseEvent<unknown>) => e.stopPropagation(),
        onChange: (_: unknown, v: boolean) => ops.toggle(v, ...xs),
      };
    },
  };
  return ops;
}

const SIZE_MAP_B = 64_848;
const SIZE_SCEN_B = 55_000;
const SIZE_RESULT_B = 110_000;
const SIZE_SOLUTION_B = 115_000_000;

// 100 MB chunks
const CHUNK_SIZE_B = 100 * 1000 * 1000;

type UseBulkMutationArgs = {
  maps?: string[];
  scens?: string[];
  results?: string[];
  includeSolutions?: boolean;
  downloadInParts?: boolean;
};

const PARALLEL_LIMIT = 5;

const resultQuery = (id: string, solutions: boolean) => ({
  queryKey: ["bulk-results", id, solutions],
  enabled: !!id,
  queryFn: () =>
    post(`${APIConfig.apiUrl}/bulk/results`, {
      scenario: id,
      solutions,
    }).then(toJson),
});

function useBulkMutationProvider() {
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const { data: all } = useBenchmarksAll();
  const mutation = useMutation({
    mutationKey: ["bulk-download"],
    mutationFn: async ({
      maps = [],
      scens = [],
      results = [],
      includeSolutions = false,
      downloadInParts = true,
    }: UseBulkMutationArgs) => {
      setProgress({
        current: 0,
        total: maps.length + scens.length + results.length,
      });

      const mapsIndex = keyBy(flatMap(all, "all"), "id");
      const scensIndex = keyBy(flatMap(flatMap(all, "all"), "scenarios"), "id");

      let part = 0;
      let runningSize = 0;

      let blobWriter = new BlobWriter();
      let zipWriter = new ZipWriter(blobWriter);

      const flush = async (more: boolean) => {
        const data = await zipWriter.close();
        download(data, `export-${part}.zip`, "application/zip");
        runningSize = 0;
        part++;
        if (more) {
          blobWriter = new BlobWriter();
          zipWriter = new ZipWriter(blobWriter);
        }
      };

      const tryFlush = async (size: number) => {
        runningSize += size;
        if (runningSize > CHUNK_SIZE_B && downloadInParts) {
          await flush(true);
        }
      };

      // ─── Export Maps ─────────────────────────────────────

      const mapNames = maps.map((m) => mapsIndex[m]?.map_name);
      const mapContents = await parallel(
        mapNames.map((m) => async () => {
          const contents = await text<string>(`/assets/maps/${m}.map`);
          setProgress((p) => ({ current: p.current + 0.5, total: p.total }));
          return {
            contents,
            name: m,
          };
        }),
        PARALLEL_LIMIT
      );

      await series(
        mapContents.map(({ name, contents }) => async () => {
          const reader = new TextReader(contents);
          const meta = await zipWriter.add(`maps/${name}.map`, reader);
          await tryFlush(meta.compressedSize);
          setProgress((p) => ({ current: p.current + 0.5, total: p.total }));
        })
      );

      // ─── Export Scenarios ────────────────────────────────

      const scensContents = await parallel(
        scens.map((s) => async () => {
          const { scen_type, type_id, map_id } = scensIndex[s];
          const mapName = mapsIndex[map_id]?.map_name;
          const contents = await text(
            `./assets/scens/${mapName}-${scen_type}-${type_id}.scen`
          );
          setProgress((p) => ({ current: p.current + 0.5, total: p.total }));
          return {
            contents,
            mapName,
            scen_type,
            type_id,
          };
        }),
        PARALLEL_LIMIT
      );

      await series(
        scensContents.map(
          ({ contents, mapName, scen_type, type_id }) =>
            async () => {
              const reader = new TextReader(contents);
              const meta = await zipWriter.add(
                `scenarios/${mapName}-${scen_type}-${type_id}.scen`,
                reader
              );
              await tryFlush(meta.compressedSize);
              setProgress((p) => ({
                current: p.current + 0.5,
                total: p.total,
              }));
            }
        )
      );

      // ─── Export Results ──────────────────────────────────

      const resultsData = await parallel(
        results.map((r) => async () => {
          const results = await queryClient.fetchQuery(
            resultQuery(r, includeSolutions)
          );
          setProgress((p) => ({ current: p.current + 0.5, total: p.total }));
          return {
            results,
            name: r,
          };
        }),
        PARALLEL_LIMIT
      );

      await series(
        resultsData.map(({ results, name }) => async () => {
          const csv = json2csv(results);
          const reader = new TextReader(csv);
          const meta = await zipWriter.add(`results/${name}.csv`, reader);
          await tryFlush(meta.compressedSize);
          setProgress((p) => ({ current: p.current + 0.5, total: p.total }));
        })
      );

      await flush(false);
    },
  });
  return { mutation, progress };
}

export const BulkDownloadContext = createContext<{
  mutation: UseMutationResult<void, unknown, UseBulkMutationArgs>;
  progress: { current: number; total: number };
} | null>(null);

export const BulkDownloadProvider = ({ children }: PropsWithChildren) => {
  const { mutation, progress } = useBulkMutationProvider();
  return (
    <BulkDownloadContext.Provider value={{ mutation, progress }}>
      {children}
    </BulkDownloadContext.Provider>
  );
};

export function useBulkMutation() {
  return useContext(BulkDownloadContext)!;
}

export function DownloadOptions({ initialMaps }: { initialMaps: string[] }) {
  const {
    mutation: { isPending, mutateAsync: startDownload },
    progress,
  } = useBulkMutation();

  const notify = useSnackbarAction();
  const theme = useTheme();
  const md = useMd();
  const xs = useXs();
  const sm = useSm();

  // ─── Selection State ─────────────────────────────────────────────────

  const maps = useSet<string>(initialMaps);
  const scens = useSet<string>();
  const results = useSet<string>();

  // ─── UI State ────────────────────────────────────────────────────────

  const [includeSolutions, setIncludeSolutions] = useState(false);
  const [downloadParts, setDownloadParts] = useState(true);
  const [expanded, setExpanded] = useBooleanMap({ root: true });
  const { data, isLoading } = useBenchmarksAll();

  const columns: GridColDef<(typeof data)[number]>[] = [
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
      renderCell: ({ row }) =>
        disambiguate(row, {
          all: (row) => (
            <Item
              primary="All items"
              secondary={pluralize("Item", row.all?.length, true)}
            />
          ),
          map: (row) => (
            <Stack sx={{ pl: 2 }}>
              <MapLabel mapId={row.id} count={row.scenarios?.length} />
            </Stack>
          ),
          scenario: (row) => (
            <Stack sx={{ pl: 4 }}>
              <ScenarioLabel scenarioId={row.id} count={row.instances} />
            </Stack>
          ),
          fallback: renderPlaceholder,
        }),
    },
    {
      align: "center",
      headerAlign: "center",
      field: "map",
      headerName: "Map (.map)",
      renderCell: ({ row }) =>
        disambiguate(row, {
          all: (row) => (
            <Checkbox {...maps.bindToggle(...map(row.all, "id"))} />
          ),
          map: (row) => <Checkbox {...maps.bindToggle(row.id)} />,
        }),
      minWidth: 32,
      flex: 0,
    },
    ...[
      { name: "Scenario (.scen)", collection: scens },
      { name: "Results (.csv)", collection: results },
    ].map(({ name, collection }) => ({
      align: "center" as const,
      headerAlign: "center" as const,
      field: name,
      headerName: name,
      renderCell: ({ row }) =>
        disambiguate(row, {
          all: (row) => (
            <Checkbox
              {...collection.bindToggle(
                ...map(flatMap(row.all, "scenarios"), "id")
              )}
            />
          ),
          map: (row) => (
            <Checkbox {...collection.bindToggle(...map(row.scenarios, "id"))} />
          ),
          scenario: (row) => <Checkbox {...collection.bindToggle(row.id)} />,
        }),
      minWidth: 32,
      flex: 0,
    })),
  ];

  const selectionMenuItems = useMemo(() => {
    const mapTypes = chain(data)
      .flatMap("all")
      .groupBy("map_type")
      .mapValues((c) => ({
        maps: map(c, "id"),
        scens: map(flatMap(c, "scenarios"), "id"),
      }))
      .value();
    const scenTypes = chain(data)
      .flatMap("all")
      .flatMap("scenarios")
      .groupBy("scen_type")
      .mapValues((c) => map(c, "id"))
      .value();
    return [
      {
        label: "All",
        maps: map(flatMap(data, "all"), "id"),
        scens: map(flatMap(flatMap(data, "all"), "scenarios"), "id"),
      },
      ...entries(mapTypes).map(([type, { maps, scens }]) => ({
        label: `Domain: ${startCase(type)}`,
        maps,
        scens,
      })),
      ...entries(scenTypes).map(([type, ids]) => ({
        label: `Scenario type: ${startCase(type)}`,
        scens: ids,
        maps: [],
      })),
    ];
  }, [data]);

  const createMenu = (v: boolean, state: State) => (
    <Menu {...bindMenu(state)}>
      {map(selectionMenuItems, ({ label, scens: s, maps: m }, i) => (
        <MenuItem
          key={i}
          onClick={() => {
            maps.toggle(v, ...m);
            scens.toggle(v, ...s);
            results.toggle(v, ...s);
            state.close();
          }}
        >
          {label}
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
                value={{ enabled: xs, setEnabled: noop }}
              >
                <TreeDataGrid
                  clickable
                  isLoading={isLoading}
                  columns={columns}
                  getChildren={(row) =>
                    disambiguate(row, {
                      all: (r) => arrayFallback(r.all, placeholder(r.id)),
                      map: (r) => arrayFallback(r.scenarios, placeholder(r.id)),
                      scenario: () => undefined,
                    })
                  }
                  expanded={expanded}
                  onExpandedChange={setExpanded}
                  onRowClick={({ row }) =>
                    disambiguate(row, {
                      scenario: (r) => {
                        const checked = scens.has(r.id) && results.has(r.id);
                        scens.toggle(!checked, r.id);
                        results.toggle(!checked, r.id);
                      },
                    })
                  }
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
            width: sm ? "100%" : 0,
            gap: 2,
            justifyContent: "flex-end",
          }}
        >
          {!xs && (
            <Tip
              title="Bulk export"
              description="Export a large quantity of data at once."
              actions={<Button>Data format reference</Button>}
            />
          )}
          <Stack sx={{ ...paper(0), p: 2, gap: 2 }}>
            <Stack>
              <Typography variant="h5" sx={{ mb: 1 }}>
                Export options
              </Typography>
              <CheckboxItem
                disableGutters
                selected={includeSolutions}
                onClick={() => setIncludeSolutions(!includeSolutions)}
              >
                Include solutions in results
              </CheckboxItem>
              <CheckboxItem
                disableGutters
                selected={downloadParts}
                onClick={() => setDownloadParts(!downloadParts)}
              >
                Download in parts (
                {thru(byteSize(CHUNK_SIZE_B), (r) => `${r.value} ${r.unit}`)}{" "}
                per part)
              </CheckboxItem>
            </Stack>
            <Stack>
              <Typography variant="h5" sx={{ mb: 1 }}>
                Selection summary
              </Typography>
              <Item
                invert
                primary={`${pluralize("map", maps.count, true)}, ${pluralize(
                  "scenario",
                  scens.count,
                  true
                )}, ${pluralize("result", results.count, true)}`}
                secondary="Files"
              />
              <Item
                invert
                primary={thru(
                  byteSize(
                    maps.count * SIZE_MAP_B +
                      scens.count * SIZE_SCEN_B +
                      results.count *
                        ((includeSolutions ? SIZE_SOLUTION_B : 0) +
                          SIZE_RESULT_B)
                  ),
                  (r) => `${r.value} ${r.unit}`
                )}
                secondary="Estimated size"
              />
            </Stack>
          </Stack>
          <Floating>
            <Button
              fullWidth
              color="primary"
              variant="contained"
              sx={{ width: "100%" }}
              disabled={isPending}
              onClick={notify(
                () =>
                  startDownload({
                    maps: maps.value,
                    scens: scens.value,
                    results: results.value,
                    includeSolutions,
                    downloadInParts: downloadParts,
                  }),
                {
                  start: "Exporting selection",
                  end: "Exported selection",
                }
              )}
            >
              {isPending
                ? `Exporting, ${floor(progress.current)} of ${progress.total}`
                : "Export selection"}
            </Button>
          </Floating>
        </Stack>
      </Stack>
    </Stack>
  );
}
