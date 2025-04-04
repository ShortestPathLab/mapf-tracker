import { Checkbox, Stack } from "@mui/material";
import { useQueries } from "@tanstack/react-query";
import byteSize from "byte-size";
import { Item } from "components/Item";
import { CheckboxItem } from "components/analysis/ChartOptions";
import { GridColDef } from "components/data-grid/DataGrid";
import {
  chain,
  entries,
  flatMap,
  map,
  some,
  startCase,
  thru,
  zip,
} from "lodash";
import { MapLabel } from "pages/submission-summary/table/MapLabel";
import { ScenarioLabel } from "pages/submission-summary/table/ScenarioLabel";
import pluralize from "pluralize";
import { scenariosQuery, useMapsData } from "queries/useMapQuery";
import { useMemo, useState } from "react";
import {
  DownloadOptionsBase,
  disambiguate,
  renderPlaceholder,
} from "./DownloadOptionsBase";
import {
  bulkDownloadMaps,
  useBulkMutation,
  useIndexAll,
} from "./useBulkMutation";
import { useSet } from "./useSet";

export function useBenchmarksAll() {
  const { data: maps, isLoading: isMapLoading } = useMapsData();
  const { data, isLoading } = useQueries({
    queries: maps?.map?.((m) => scenariosQuery(m.id)) ?? [],
    combine: (result) => ({
      isLoading: some(result, "isLoading"),
      data: zip(maps, map(result, "data"))?.map?.(([map, data]) => ({
        ...map,
        scenarios: data,
      })),
    }),
  });
  return {
    data: [{ maps: data, id: "root" }],
    isLoading: isLoading || isMapLoading,
  };
}
const SIZE_MAP_B = 64848;
const SIZE_SCEN_B = 55000;
const SIZE_RESULT_B = 110000;
const SIZE_SOLUTION_B = 115000000;
// 100 MB chunks

export const CHUNK_SIZE_B = 100 * 1000 * 1000;

export function DownloadOptions() {
  const { mapsIndex, scensIndex } = useIndexAll();
  const {
    mutation: { isPending, mutateAsync: startDownload },
    progress,
    setProgress,
  } = useBulkMutation();
  const { data, isLoading } = useBenchmarksAll();

  // ─── Selection State ─────────────────────────────────────────────────
  const maps = useSet<string>();
  const scens = useSet<string>();
  const results = useSet<string>();

  // ─── UI State ────────────────────────────────────────────────────────
  const [includeSolutions, setIncludeSolutions] = useState(false);
  const [downloadParts, setDownloadParts] = useState(true);

  // ─────────────────────────────────────────────────────────────────────
  const columns: GridColDef<(typeof data)[number]>[] = [
    {
      align: "center",
      headerAlign: "center",
      field: "map",
      headerName: "Map (.map)",
      renderCell: ({ row }) =>
        disambiguate(row, {
          all: (row) => (
            <Checkbox {...maps.bindToggle(...map(row.maps, "id"))} />
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
                ...map(flatMap(row.maps, "scenarios"), "id")
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
      .flatMap("maps")
      .groupBy("map_type")
      .mapValues((c) => ({
        maps: map(c, "id"),
        scens: map(flatMap(c, "scenarios"), "id"),
      }))
      .value();
    const scenTypes = chain(data)
      .flatMap("maps")
      .flatMap("scenarios")
      .groupBy("scen_type")
      .mapValues((c) => map(c, "id"))
      .value();
    return [
      {
        label: "All",
        maps: map(flatMap(data, "maps"), "id"),
        scens: map(flatMap(flatMap(data, "maps"), "scenarios"), "id"),
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

  return (
    <DownloadOptionsBase
      rows={data}
      columns={columns}
      onSubmit={() =>
        startDownload(() =>
          bulkDownloadMaps(
            {
              maps: maps.value,
              scens: scens.value,
              results: results.value,
              includeSolutions,
              downloadInParts: downloadParts,
            },
            mapsIndex,
            scensIndex,
            setProgress
          )
        )
      }
      options={
        <>
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
            {thru(byteSize(CHUNK_SIZE_B), (r) => `${r.value} ${r.unit}`)} per
            part)
          </CheckboxItem>
        </>
      }
      summary={
        <>
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
                    ((includeSolutions ? SIZE_SOLUTION_B : 0) + SIZE_RESULT_B)
              ),
              (r) => `${r.value} ${r.unit}`
            )}
            secondary="Estimated size"
          />
        </>
      }
      selectionMenuItems={selectionMenuItems}
      onRowClick={(row) =>
        disambiguate(row, {
          scenario: (r) => {
            const checked = scens.has(r.id) && results.has(r.id);
            scens.toggle(!checked, r.id);
            results.toggle(!checked, r.id);
          },
        })
      }
      onSelectionMenuItemClick={(v, { maps: m, scens: s }) => {
        maps.toggle(v, ...m);
        scens.toggle(v, ...s);
        results.toggle(v, ...s);
      }}
      isLoading={isLoading}
      isRunning={isPending}
      progress={progress}
      renderLabel={(row) =>
        disambiguate(row, {
          all: (row) => (
            <Item
              primary="All benchmarks"
              secondary={pluralize("Item", row.maps?.length, true)}
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
        })
      }
    />
  );
}
