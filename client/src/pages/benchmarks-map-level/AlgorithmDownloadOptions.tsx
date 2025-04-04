import { Checkbox, Stack } from "@mui/material";
import { useQueries } from "@tanstack/react-query";
import byteSize from "byte-size";
import { CheckboxItem } from "components/analysis/ChartOptions";
import { Item } from "components/Item";
import {
  chain,
  entries,
  filter,
  find,
  flatMap,
  map,
  some,
  startCase,
  thru,
  zip,
} from "lodash";
import { AlgorithmPreview } from "pages/algorithms/AlgorithmPreview";
import { MapLabel } from "pages/submission-summary/table/MapLabel";
import { ScenarioLabel } from "pages/submission-summary/table/ScenarioLabel";
import pluralize from "pluralize";
import {
  algorithmSummaryQuery,
  useAlgorithmsData,
} from "queries/useAlgorithmQuery";
import { useMemo, useState } from "react";
import { CHUNK_SIZE_B } from "./DownloadOptions";
import {
  DownloadOptionsBase,
  disambiguate,
  renderPlaceholder,
} from "./DownloadOptionsBase";
import {
  decodeAlgorithmResource,
  encodeAlgorithmResource,
} from "./encodeAlgorithmResource";
import {
  bulkDownloadAlgorithms,
  useBulkMutation,
  useIndexAll,
} from "./useBulkMutation";
import { useSet } from "./useSet";

const SIZE_SUMMARY_B = 900;
const SIZE_SUBMISSION_B = 5520;

export function AlgorithmDownloadOptions({
  algorithm,
}: {
  algorithm?: string;
}) {
  const {
    mutation: { mutateAsync: startDownload, isPending },
    progress,
    setProgress,
  } = useBulkMutation();

  const [downloadParts, setDownloadParts] = useState(true);

  const { mapsIndex, scensIndex, isLoading: isLoading3 } = useIndexAll();
  const { data: _algorithms, isLoading } = useAlgorithmsData();
  const algorithms = algorithm
    ? filter(_algorithms, (a) => a._id === algorithm)
    : _algorithms;
  const { data, isLoading: isLoading2 } = useQueries({
    queries: map(algorithms, (a) => algorithmSummaryQuery(a._id)),
    combine: (result) => ({
      isLoading: some(result, "isLoading"),
      data: zip(algorithms, map(result, "data")).map(([a, d]) => ({
        _id: a._id,
        name: a.algo_name,
        data: d,
      })),
    }),
  });
  // const { data, isLoading } = useAlgorithmSummaryQuery(algorithm);

  const rows = useMemo(
    () =>
      map(data, ({ _id, data, name }) => ({
        id: _id,
        name,
        maps: map(data?.maps, (c) => ({
          ...c,
          ...mapsIndex[c.id],
          id: encodeAlgorithmResource(_id, c.id),
          scenarios: map(c.scenarios, (s) => ({
            ...s,
            ...scensIndex[s.id],
            id: encodeAlgorithmResource(_id, s.id),
            instances: s.count.total,
          })),
        })),
      })),
    [data, mapsIndex, scensIndex]
  );

  // ─── Selection State ─────────────────────────────────────────────────

  // Algorithm IDs
  const summaries = useSet<string>();

  // Scenario IDs
  const submissions = useSet<string>();

  const columns = [
    {
      name: "Summary",
      collection: summaries,
      scenarioLevel: false,
      align: "center" as const,
      headerAlign: "center" as const,
      field: "Summary",
      headerName: "Summary",
      renderCell: ({ row }) =>
        disambiguate(row, {
          all: (row) => <Checkbox {...summaries.bindToggle(row.id)} />,
        }),
      minWidth: 32,
      flex: 0,
    },
    {
      name: "Submissions",
      collection: submissions,
      scenarioLevel: true,
      align: "center" as const,
      headerAlign: "center" as const,
      field: "Submissions",
      headerName: "Submissions",
      renderCell: ({ row }) =>
        disambiguate(row, {
          all: (row) => (
            <Checkbox
              {...submissions.bindToggle(
                ...map(flatMap(row.maps, "scenarios"), "id")
              )}
            />
          ),
          map: (row) => (
            <Checkbox
              {...submissions.bindToggle(...map(row.scenarios, "id"))}
            />
          ),
          scenario: (row) => <Checkbox {...submissions.bindToggle(row.id)} />,
        }),
      minWidth: 32,
      flex: 0,
    },
  ];

  const selectionMenuItems = useMemo(() => {
    const mapTypes = chain(rows)
      .flatMap("maps")
      .groupBy("map_type")
      .mapValues((c) => ({
        maps: map(c, "id"),
        scens: map(flatMap(c, "scenarios"), "id"),
      }))
      .value();
    const scenTypes = chain(rows)
      .flatMap("maps")
      .flatMap("scenarios")
      .groupBy("scen_type")
      .mapValues((c) => map(c, "id"))
      .value();
    return [
      {
        label: "All",
        algorithms: map(rows, "id"),
        scens: map(flatMap(flatMap(rows, "maps"), "scenarios"), "id"),
      },
      ...entries(mapTypes).map(([type, { scens }]) => ({
        label: `Domain: ${startCase(type)}`,
        scens,
        algorithms: [],
      })),
      ...entries(scenTypes).map(([type, ids]) => ({
        label: `Scenario type: ${startCase(type)}`,
        scens: ids,
        algorithms: [],
      })),
    ];
  }, [rows]);

  return (
    <DownloadOptionsBase
      progress={progress}
      isRunning={isPending}
      onSubmit={() =>
        startDownload(() =>
          bulkDownloadAlgorithms(
            {
              summaries: summaries.value,
              submissions: submissions.value,
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
            primary={`${pluralize(
              "summary",
              summaries.count,
              true
            )}, ${pluralize("submission", submissions.count, true)}`}
            secondary="Files"
          />
          <Item
            invert
            primary={thru(
              byteSize(
                summaries.count * SIZE_SUMMARY_B +
                  submissions.count * SIZE_SUBMISSION_B
              ),
              (r) => `${r.value} ${r.unit}`
            )}
            secondary="Estimated size"
          />
        </>
      }
      rows={rows}
      columns={columns}
      isLoading={isLoading || isLoading2 || isLoading3}
      selectionMenuItems={selectionMenuItems}
      onSelectionMenuItemClick={(v, { algorithms: a, scens: s }) => {
        submissions.toggle(v, ...s);
        summaries.toggle(v, ...a);
      }}
      renderLabel={(row) =>
        disambiguate(row, {
          all: (row) => (
            <Item
              icon={<AlgorithmPreview id={row.id} />}
              primary={find(algorithms, { _id: row.id })?.algo_name}
              secondary={pluralize("Item", row.maps?.length, true)}
            />
          ),
          map: (row) => (
            <Stack sx={{ pl: 2 }}>
              <MapLabel
                mapId={decodeAlgorithmResource(row.id).resource}
                count={row.scenarios?.length}
              />
            </Stack>
          ),
          scenario: (row) => (
            <Stack sx={{ pl: 4 }}>
              <ScenarioLabel
                scenarioId={decodeAlgorithmResource(row.id).resource}
                count={row.instances}
              />
            </Stack>
          ),
          fallback: renderPlaceholder,
        })
      }
    />
  );
}
