import {
  ChevronRight,
  CloseOutlined,
  DeleteOutlined,
  DoneOutlined,
  DoNotDisturbOutlined,
  HourglassEmptyOutlined,
  PendingOutlined,
  RouteOutlined,
} from "@mui/icons-material";
import {
  alpha,
  Box,
  capitalize,
  Chip,
  CircularProgress,
  Skeleton,
  Stack,
  useTheme,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { Bar, DataGridTitle, useDataGridActions } from "components/data-grid";
import { GridColDef } from "components/data-grid/DataGrid";
import Enter from "components/dialog/Enter";
import { FlatCard } from "components/FlatCard";
import {
  TreeDataGrid,
  useBooleanMap,
} from "components/tree-data-grid/TreeDataGrid";
import { SummaryByApiKeyResult } from "core/types";
import { format, parseISO } from "date-fns";
import { DialogContentProps, useDialog } from "hooks/useDialog";
import { isNumber, isUndefined, join, map, startCase, times } from "lodash";
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
import { ReactNode } from "react";
import GenericDetailsList from "./GenericDetailsList";
import { IconCard } from "components/IconCard";

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

function DetailsDialog({
  index,
  scenarioId,
  apiKey,
}: SubmissionInstanceProps & DialogContentProps) {
  const { data: scenario } = useScenarioData(scenarioId);
  return (
    <SubmissionInstanceContext
      {...{ index, scenarioId, apiKey }}
      render={({ instance, submission, isLoading }) =>
        isLoading ? (
          <CircularProgress />
        ) : (
          <Stack sx={{ gap: 2 }}>
            <MapLabel mapId={scenario?.map_id} />
            <ScenarioLabel scenarioId={scenarioId} />
            <Stack direction="row" sx={{ gap: 2, alignItems: "center" }}>
              <Box sx={{ width: 48 }} />
              <DataGridTitle
                primary={pluralize("agent", instance?.agents, true)}
                secondary="Instance"
              />
            </Stack>
            <FlatCard>
              <GenericDetailsList data={submission} />
            </FlatCard>
          </Stack>
        )
      }
    />
  );
}

export default function Table({ apiKey }: { apiKey?: string | number }) {
  const theme = useTheme();
  const { dialog, open } = useDialog(DetailsDialog, {
    title: "Submission details",
    padded: true,
  });
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

  const total = (row: Models["map"] | Models["scenario"]) =>
    row.count.total - row.count.outdated;

  const bar = (row: Models["map"] | Models["scenario"]) => (
    <Bar
      buffer
      values={[
        {
          color:
            row.count.valid === total(row) ? "success.main" : "primary.main",
          value: row.count.valid / total(row),
          label: "Valid",
        },
        {
          color: "error.main",
          value: row.count.invalid / total(row),
          label: "Invalid",
        },
        {
          color: alpha(theme.palette.primary.main, 0.4),
          value: row.count.queued / total(row),
          label: "Running",
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
      headerName: "Validity",
      type: "number",
      renderCell: ({ row }) =>
        disambiguate(row, {
          map: bar,
          scenario: bar,
          instance: (row) => (
            // (
            //   <SubmissionInstanceContext
            //     apiKey={apiKey}
            //     scenarioId={row.scenario}
            //     index={row.index}
            //     render={({ submission, isLoading }) => (
            //       <Typography variant="body2">
            //         {isLoading ? (
            //           "-"
            //         ) : (
            //           <Chip
            //             label={capitalize(submission?.validation?.outcome)}
            //             color={
            //               {
            //                 outdated: "default",
            //                 valid: "success",
            //                 invalid: "error",
            //               }[submission?.validation?.outcome] ?? ("warning" as any)
            //             }
            //           />
            //         )}
            //       </Typography>
            //     )}
            //   />
            // )
            <SubmissionInstanceContext
              apiKey={apiKey}
              scenarioId={row.scenario}
              index={row.index}
              render={({ submission, isLoading }) => (
                <Bar
                  label={
                    {
                      valid: <DoneOutlined color="success" fontSize="small" />,
                      invalid: <CloseOutlined color="error" fontSize="small" />,
                      outdated: (
                        <DoNotDisturbOutlined
                          color="disabled"
                          fontSize="small"
                        />
                      ),
                      queued: (
                        <HourglassEmptyOutlined
                          color="primary"
                          fontSize="small"
                        />
                      ),
                    }[submission?.validation?.outcome] ?? (
                      <HourglassEmptyOutlined
                        color="disabled"
                        fontSize="small"
                      />
                    )
                  }
                  buffer
                  values={[
                    {
                      valid: {
                        color: "success.main",
                        value: 1,
                        label: "Valid",
                      },
                      invalid: {
                        color: "error.main",
                        value: 1,
                        label: "Invalid",
                      },
                      queued: {
                        color: alpha(theme.palette.primary.main, 0.4),
                        value: 1,
                        label: "Running",
                      },
                      outdated: {
                        color: "action.disabled",
                        value: 1,
                        label: "Unused - duplicate",
                      },
                      loading: {
                        value: 1,
                        color: "text.secondary",
                        label: "Pending",
                      },
                    }[
                      isLoading ? "loading" : submission?.validation?.outcome
                    ] ?? {
                      color: "success.main",
                      value: 0,
                      label: "Pending",
                    },
                  ]}
                />
              )}
            />
          ),
        }),
      fold: true,
      width: 300,
    },
    {
      field: "info",
      headerName: "Info",
      type: "number",
      renderCell: ({ row }) =>
        disambiguate(row, {
          instance: (row) => (
            <SubmissionInstanceContext
              apiKey={apiKey}
              scenarioId={row.scenario}
              index={row.index}
              render={({ isLoading, submission, instance }) =>
                isLoading ? (
                  ""
                ) : (
                  <Box
                    sx={{
                      overflow: "hidden",
                      width: " 100%",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {submission?.validation?.isValidationRun &&
                    submission?.validation?.outcome !== "outdated"
                      ? submission?.validation?.errors?.length
                        ? capitalize(join(submission?.validation?.errors, ", "))
                        : isNumber(instance?.solution_cost)
                        ? instance.solution_cost > submission.cost
                          ? `New record (${submission.cost} to ${instance.solution_cost})`
                          : `Dominated (${submission.cost} to ${instance.solution_cost})`
                        : `New record (${submission.cost}, no previous claims)`
                      : ""}
                  </Box>
                )
              }
            />
          ),
        }),
      fold: true,
      width: 380,
    },
    actions,
  ];

  return (
    <>
      <Stack sx={{ p: 2, gap: 1 }} direction="row">
        {["Valid", "Invalid", "Duplicate", "All"].map((c) => (
          <Chip label={c} variant="outlined" onClick={() => {}} />
        ))}
      </Stack>
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
        onRowClick={({ row }) =>
          disambiguate(row, {
            instance: (row) =>
              open({
                apiKey,
                index: row.index,
                scenarioId: row.scenario,
              }),
          })
        }
        expanded={expanded}
        onExpandedChange={setExpanded}
        isLoading={isLoading}
        columns={columns}
        rows={data?.maps}
      />
      {dialog}
    </>
  );
}

export function MapLabel({ mapId, count }: { mapId: string; count?: number }) {
  const { data: map } = useMapData(mapId);
  return (
    <Enter in axis="x">
      <Stack direction="row" sx={{ gap: 2, alignItems: "center" }}>
        <Box
          component="img"
          sx={{ borderRadius: 1, height: 48 }}
          src={`/mapf-svg/${map?.map_name}.svg`}
        />
        <DataGridTitle
          primary={startCase(map?.map_name ?? "-")}
          secondary={
            isUndefined(count) ? "Map" : pluralize("item", count, true)
          }
        />
      </Stack>
    </Enter>
  );
}

export function ScenarioLabel({
  scenarioId,
  count,
}: {
  scenarioId: string;
  count?: number;
}) {
  const { data } = useScenarioData(scenarioId);
  return (
    <Enter in axis="x">
      <Stack direction="row" sx={{ gap: 2, alignItems: "center" }}>
        <Stack sx={{ width: 48, alignItems: "center" }}>
          <IconCard icon={<RouteOutlined />} />
        </Stack>
        <DataGridTitle
          primary={`${startCase(data?.scen_type ?? "-")}-${
            data?.type_id ?? "-"
          }`}
          secondary={
            isUndefined(count) ? "Scenario" : pluralize("item", count, true)
          }
        />
      </Stack>
    </Enter>
  );
}

type SubmissionInstanceProps = {
  apiKey?: string | number;
  scenarioId: string;
  index: number;
};

function useSubmissionInstance({
  apiKey,
  scenarioId,
  index,
}: SubmissionInstanceProps) {
  const { data: submissions, isLoading: isSubmissionLoading } =
    useOngoingSubmissionScenarioQuery(apiKey, scenarioId);
  const submission = submissions?.[index];
  const { data: instance, isLoading: isInstanceLoading } = useInstanceData(
    submission?.instance
  );
  const isLoading = isSubmissionLoading || isInstanceLoading;
  return {
    isLoading,
    isSubmissionLoading,
    isInstanceLoading,
    submissions,
    instance,
    submission,
  };
}

function SubmissionInstanceContext({
  apiKey,
  scenarioId,
  index,
  render,
}: SubmissionInstanceProps & {
  render: (r: ReturnType<typeof useSubmissionInstance>) => ReactNode;
}) {
  const r = useSubmissionInstance({ apiKey, scenarioId, index });
  return render(r);
}

export function SubmissionInstanceLabel(props: SubmissionInstanceProps) {
  return (
    <SubmissionInstanceContext
      {...props}
      render={({ isLoading, submission, instance }) => (
        <Enter in axis="x">
          <Stack
            direction="row"
            sx={{
              gap: 2,
              alignItems: "center",
            }}
          >
            <Box sx={{ width: 48 }} />
            <DataGridTitle
              primary={
                isLoading ? (
                  <Skeleton sx={{ width: 120 }} />
                ) : (
                  <Box
                    component="span"
                    sx={{
                      textDecoration:
                        submission?.validation?.outcome === "outdated"
                          ? "line-through"
                          : undefined,
                    }}
                  >
                    {pluralize("agent", instance?.agents ?? 0, true)}
                  </Box>
                )
              }
              secondary={
                !isLoading && submission?.createdAt ? (
                  format(parseISO(submission?.createdAt), "MMM dd HH:mm aaa")
                ) : (
                  <Skeleton sx={{ width: 80 }} />
                )
              }
            />
          </Stack>
        </Enter>
      )}
    />
  );
}
