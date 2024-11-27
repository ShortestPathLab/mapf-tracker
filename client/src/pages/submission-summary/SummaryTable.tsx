import { ChevronRight, DeleteOutlined } from "@mui/icons-material";
import { Box, Skeleton, Stack, useTheme } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import {
  Bar,
  cellRendererBar,
  DataGridTitle,
  useDataGridActions,
} from "components/data-grid";
import { GridColDef } from "components/data-grid/DataGrid";
import Enter from "components/dialog/Enter";
import {
  TreeDataGrid,
  useBooleanMap,
} from "components/tree-data-grid/TreeDataGrid";
import { SummaryByApiKeyResult } from "core/types";
import { map, startCase, times } from "lodash";
import pluralize from "pluralize";
import { useMapData, useScenarioData } from "queries/useBenchmarksQuery";
import { useInstanceData } from "queries/useInstanceQuery";
import {
  deleteAll,
  ongoingSubmissionScenarioQueryFn,
  useDeleteOngoingSubmissionMutation,
  useOngoingSubmissionScenarioQuery,
  useOngoingSubmissionSummaryQuery,
} from "queries/useOngoingSubmissionQuery";

type Models = {
  map: SummaryByApiKeyResult["maps"][0];
  scenario: SummaryByApiKeyResult["maps"][0]["scenarios"][0];
  instance: { id: string; scenario: string; index: number };
};

type Model = Models[keyof Models];

function disambiguate<R>(
  m: Model,
  options: { [K in keyof Models]?: (m: Models[K]) => R }
) {
  if ("scenarios" in m) return options?.map?.(m);
  if ("count" in m) return options?.scenario?.(m);
  return options?.instance?.(m);
}

function Arrow({ open }: { open?: boolean }) {
  return (
    <ChevronRight
      color="action"
      sx={{
        my: "auto",
        transform: open ? "rotate(90deg)" : "rotate(0deg)",
        transition: (t) => t.transitions.create("transform"),
      }}
    />
  );
}

const useDeleteOngoingSubmissionMutation1 = (apiKey?: string | number) => {
  const { mutateAsync: deleteEntry } =
    useDeleteOngoingSubmissionMutation(apiKey);
  return useMutation({
    mutationKey: ["deleteOngoingSubmission1"],
    mutationFn: async ({
      scenario,
      index,
    }: {
      scenario: string;
      index: number | typeof deleteAll;
    }) => {
      const sx = await ongoingSubmissionScenarioQueryFn(apiKey, scenario);
      return index === deleteAll
        ? await deleteEntry?.(map(sx, "id"))
        : await deleteEntry?.(sx?.[index]?.id);
    },
  });
};

export default function Table({ apiKey }: { apiKey?: string | number }) {
  const theme = useTheme();
  const { data, isLoading } = useOngoingSubmissionSummaryQuery(apiKey);
  const { mutateAsync: deleteEntry } =
    useDeleteOngoingSubmissionMutation1(apiKey);

  const [expanded, setExpanded] = useBooleanMap();

  const actions = useDataGridActions<Model>({
    menuItems: [
      {
        hidden: (row) =>
          disambiguate(row, {
            map: () => true,
            scenario: () => false,
            instance: () => false,
          }),
        name: "Delete",
        icon: <DeleteOutlined />,
        action: (row) =>
          disambiguate(row, {
            scenario: (row) =>
              deleteEntry({ scenario: row.id, index: deleteAll }),
            instance: (row) =>
              deleteEntry({ scenario: row.scenario, index: row.index }),
          }),
      },
    ],
  });

  const bar = (row: Models["map"] | Models["scenario"]) => (
    <Bar
      values={[
        {
          color: "success.main",
          value: row.count.valid / row.count.total,
          label: "Invalid",
        },
        {
          color: "error.main",
          value: row.count.error / row.count.total,
          label: "Valid",
        },
        {
          color: theme.palette.divider,
          value: row.count.outdated / row.count.total,
          label: "Ignored",
        },
      ]}
    />
  );

  const columns: GridColDef<Model>[] = [
    {
      field: "Icon",
      width: 48,
      renderCell: ({ row }) =>
        disambiguate(row, {
          map: () => <Arrow open={expanded[row.id]} />,
          scenario: () => <Arrow open={expanded[row.id]} />,
        }),
      flex: 0,
    },
    {
      field: "name",
      headerName: "Submission",
      minWidth: 220,
      flex: 1,
      renderCell: ({ row }) =>
        disambiguate(row, {
          map: (row) => (
            <MapLabel mapId={row.id} count={row.count.total ?? 0} />
          ),
          scenario: (row) => (
            <ScenarioLabel scenarioId={row.id} count={row.count.total ?? 0} />
          ),
          instance: ({ scenario, index }) => (
            <SubmissionInstanceLabel
              apiKey={apiKey}
              scenarioId={scenario}
              index={index}
            />
          ),
        }),
    },
    {
      field: "count.valid",
      headerName: "Progress",
      type: "number",
      align: "center",
      headerAlign: "center",
      renderCell: ({ row }) =>
        disambiguate(row, {
          map: bar,
          scenario: bar,
        }),
      fold: true,
      width: 300,
    },
    actions,
  ];

  return (
    <TreeDataGrid
      getChildren={(row) =>
        disambiguate(row, {
          map: (row) => row.scenarios,
          scenario: (row) =>
            times(row.count.total, (i) => ({
              id: `${row.id}-${i}`,
              scenario: row.id,
              index: i,
            })),
          instance: () => [],
        })
      }
      clickable
      expanded={expanded}
      onExpandedChange={setExpanded}
      isLoading={isLoading}
      columns={columns}
      rows={data?.maps}
    />
  );
}

export function MapLabel({ mapId, count }: { mapId: string; count: number }) {
  const { data: map } = useMapData(mapId);
  return (
    <Stack direction="row" sx={{ gap: 2, alignItems: "center" }}>
      <Box
        component="img"
        sx={{ borderRadius: 1, height: 48 }}
        src={`/mapf-svg/${map?.map_name}.svg`}
      />
      <DataGridTitle
        primary={startCase(map?.map_name ?? "-")}
        secondary={pluralize("item", count, true)}
      />
    </Stack>
  );
}

export function ScenarioLabel({
  scenarioId,
  count,
}: {
  scenarioId: string;
  count: number;
}) {
  const { data } = useScenarioData(scenarioId);
  return (
    <Enter in axis="x">
      <Stack direction="row" sx={{ gap: 2, alignItems: "center" }}>
        <Box sx={{ width: 48 }} />
        <DataGridTitle
          primary={`${startCase(data?.scen_type ?? "-")}-${
            data?.type_id ?? "-"
          }`}
          secondary={pluralize("item", count, true)}
        />
      </Stack>
    </Enter>
  );
}
export function SubmissionInstanceLabel({
  apiKey,
  scenarioId,
  index,
}: {
  apiKey?: string | number;
  scenarioId: string;
  index: number;
}) {
  const { data: submissions, isLoading: isSubmissionLoading } =
    useOngoingSubmissionScenarioQuery(apiKey, scenarioId);
  const submission = submissions?.[index];
  const { data: instance, isLoading: isInstanceLoading } = useInstanceData(
    submission?.instance
  );
  const isLoading = isSubmissionLoading || isInstanceLoading;
  return (
    <Enter in axis="x">
      <Stack direction="row" sx={{ gap: 2, alignItems: "center" }}>
        <Box sx={{ width: 48 }} />
        <DataGridTitle
          primary={
            isLoading ? (
              <Skeleton sx={{ width: 120 }} />
            ) : (
              `Submission ${submission?.id?.slice(-8)}`
            )
          }
          secondary={
            isLoading ? (
              <Skeleton sx={{ width: 80 }} />
            ) : (
              pluralize("agent", instance?.agents ?? 0, true)
            )
          }
        />
      </Stack>
    </Enter>
  );
}
