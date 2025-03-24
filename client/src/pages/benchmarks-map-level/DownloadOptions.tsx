import { Box, Button, Checkbox, Stack, Typography } from "@mui/material";
import { useQueries } from "@tanstack/react-query";
import { BottomBarContext } from "App";
import { GridColDef } from "components/data-grid/DataGrid";
import { Scroll } from "components/dialog/Scrollbars";
import { useSm } from "components/dialog/useSmallDisplay";
import { FlatCard } from "components/FlatCard";
import { Floating } from "components/Floating";
import { Item } from "components/Item";
import Enter from "components/transitions/Enter";
import {
  TreeDataGrid,
  useBooleanMap,
} from "components/tree-data-grid/TreeDataGrid";
import { Benchmark, InstanceCollection } from "core/types";
import { map, noop, some, zip } from "lodash";
import { Arrow } from "pages/submission-summary/table/Arrow";
import { MapLabel } from "pages/submission-summary/table/MapLabel";
import { ScenarioLabel } from "pages/submission-summary/table/ScenarioLabel";
import pluralize from "pluralize";
import {
  instanceScenarioQuery,
  useBenchmarksData,
} from "queries/useBenchmarksQuery";
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
    queries: maps?.map?.((m) => instanceScenarioQuery(m.id)),
    combine: (result) => ({
      isLoading: some(result, "isLoading"),
      data: zip(maps, map(result, "data")).map(([map, data]) => ({
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

export function DownloadOptions({ initialMaps }: { initialMaps: string[] }) {
  const [maps, { set: setMaps, push: pushMaps, filter: filterMaps }] =
    useList<string>(initialMaps);
  const [expanded, setExpanded] = useBooleanMap({ root: true });
  const sm = useSm();
  const { data: all, isLoading } = useBenchmarksAll();
  const columns: GridColDef<(typeof all)[number]>[] = [
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
      renderCell: ({ row }) =>
        disambiguate(row, {
          all: (row) => (
            <Item
              primary="All maps"
              secondary={pluralize("Item", row.all?.length, true)}
            />
          ),
          map: (row) => (
            <MapLabel mapId={row.id} count={row.scenarios?.length} />
          ),
          scenario: (row) => (
            <Stack sx={{ pl: 2 }}>
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
      headerName: "Map",
      renderCell: ({ row }) =>
        disambiguate(row, {
          all: (row) => (
            <Checkbox
              indeterminate={maps.length && maps.length !== row.all?.length}
              checked={maps.length === row.all?.length}
              onClick={(e) => e.stopPropagation()}
              onChange={(e, v) => {
                if (v) {
                  setMaps(map(row.all, "id"));
                } else {
                  setMaps([]);
                }
              }}
            />
          ),
          map: (row) => (
            <Checkbox
              checked={maps.includes(row.id)}
              indeterminate={!maps.includes(row.id) && false}
              onClick={(e) => e.stopPropagation()}
              onChange={(e, v) => {
                if (v) {
                  pushMaps(row.id);
                } else {
                  filterMaps((m) => m !== row.id);
                }
              }}
            />
          ),
        }),
      minWidth: 48,
    },
    {
      align: "center",
      headerAlign: "center",
      field: "scenario",
      headerName: "Scenario",
      renderCell: ({ row }) =>
        disambiguate(row, {
          all: (row) => (
            <Checkbox
              indeterminate={maps.length && maps.length !== row.all?.length}
              checked={maps.length === row.all?.length}
              onClick={(e) => e.stopPropagation()}
              onChange={(e, v) => {
                if (v) {
                  setMaps(map(row.all, "id"));
                } else {
                  setMaps([]);
                }
              }}
            />
          ),
          map: (row) => (
            <Checkbox
              checked={maps.includes(row.id)}
              indeterminate={!maps.includes(row.id) && false}
              onClick={(e) => e.stopPropagation()}
              onChange={(e, v) => {
                if (v) {
                  pushMaps(row.id);
                } else {
                  filterMaps((m) => m !== row.id);
                }
              }}
            />
          ),
          scenario: (row) => (
            <Checkbox
              checked={maps.includes(row.id)}
              indeterminate={!maps.includes(row.id) && false}
              onClick={(e) => e.stopPropagation()}
              onChange={(e, v) => {
                if (v) {
                  pushMaps(row.id);
                } else {
                  filterMaps((m) => m !== row.id);
                }
              }}
            />
          ),
        }),
      minWidth: 48,
    },
    {
      align: "center",
      headerAlign: "center",
      field: "solutions",
      headerName: "Solutions",
      renderCell: ({ row }) => (
        <Checkbox
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      ),
      minWidth: 48,
    },
  ];
  return (
    <Stack gap={2}>
      <Stack direction={sm ? "column" : "row"} sx={{ gap: 2 }}>
        <Stack sx={{ flex: 1, width: sm ? "100%" : 0, gap: 2 }}>
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
            <Button variant="contained">Select by...</Button>
            <Button variant="outlined">Deselect by...</Button>
          </Stack>
          <FlatCard>
            <Scroll y style={{ height: "70vh" }}>
              <BottomBarContext.Provider
                value={{ enabled: false, setEnabled: noop }}
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
                  rows={all}
                />
              </BottomBarContext.Provider>
            </Scroll>
          </FlatCard>
        </Stack>
        <Stack sx={{ flex: 1, width: sm ? "100%" : 0, gap: 2 }}>
          <Stack sx={{ ...paper(0), p: 2 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Selection summary
            </Typography>
            <Item invert primary={"5 MB"} secondary="Estimated size" />
          </Stack>
          <Floating>
            <Button
              fullWidth
              color="primary"
              variant="contained"
              sx={{ width: "100%" }}
            >
              Download
            </Button>
          </Floating>
        </Stack>
      </Stack>
    </Stack>
  );
}
