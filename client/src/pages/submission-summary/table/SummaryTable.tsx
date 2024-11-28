import {
  CloseOutlined,
  DeleteOutlined,
  DoneOutlined,
  DoNotDisturbOutlined,
  HourglassEmptyOutlined,
  PendingOutlined,
} from "@mui/icons-material";
import {
  alpha,
  Box,
  capitalize,
  Chip,
  Collapse,
  Grow,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { Bar, DataGridTitle, useDataGridActions } from "components/data-grid";
import { GridColDef } from "components/data-grid/DataGrid";
import {
  TreeDataGrid,
  useBooleanMap,
} from "components/tree-data-grid/TreeDataGrid";
import { useDialog } from "hooks/useDialog";
import { isNumber, join, times } from "lodash";
import {
  deleteAll,
  OngoingSubmission,
  useOngoingSubmissionSummaryQuery,
} from "queries/useOngoingSubmissionQuery";
import { useDeleteOngoingSubmissionByScenarioIndexMutation } from "./useDeleteOngoingSubmissionByScenarioIndexMutation";
import { DetailsDialog } from "./DetailsDialog";
import { Arrow } from "./Arrow";
import { Model, disambiguate, Models } from "./Model";
import { SubmissionInstanceContext } from "./SubmissionInstanceContext";
import { MapLabel } from "./MapLabel";
import { ScenarioLabel } from "./ScenarioLabel";
import { SubmissionInstanceLabel } from "./SubmissionInstanceLabel";
import { Instance, SummarySlice } from "core/types";
import { useState } from "react";
import Enter from "components/dialog/Enter";

function getSubmissionInfoText(
  submission: OngoingSubmission,
  instance: Instance
) {
  if (
    submission?.validation?.isValidationRun &&
    submission?.validation?.outcome !== "outdated"
  ) {
    const errors = submission?.validation?.errors;
    if (errors?.length) {
      return capitalize(join(errors, ", "));
    }

    if (isNumber(instance?.solution_cost)) {
      const isImprovement = instance.solution_cost > submission.cost;
      return [
        isImprovement ? "New record" : "Dominated",
        `(yours: ${submission.cost}, best: ${instance.solution_cost})`,
      ].join(" ");
    }

    return `New record (${submission.cost}, no previous claims)`;
  }

  return "";
}

function arrayFallback<T, U>(s: T[] | undefined, u: U) {
  return s?.length ? s : u;
}

function placeholder(id: string) {
  return [{ id: `${id}-placeholder` }];
}

function renderPlaceholder() {
  return (
    <Enter in axis="x">
      <Stack direction="row">
        <Box sx={{ width: 64 }} />
        <DataGridTitle secondary="No items" />
      </Stack>
    </Enter>
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
    useDeleteOngoingSubmissionByScenarioIndexMutation(apiKey);

  const [expanded, setExpanded] = useBooleanMap();
  const [slice, setSlice] = useState<keyof SummarySlice>("total");

  const actions = useDataGridActions<Model>({
    menuItems: [
      {
        hidden: (row) =>
          disambiguate(row, {
            map: () => true,
            scenario: () => false,
            instance: () => false,
            fallback: () => true,
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
          map: (row) => <Arrow open={expanded[row.id]} />,
          scenario: (row) => <Arrow open={expanded[row.id]} />,
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
            <MapLabel mapId={row.id} count={row.count[slice] ?? 0} />
          ),
          scenario: (row) => (
            <ScenarioLabel scenarioId={row.id} count={row.count[slice] ?? 0} />
          ),
          instance: ({ scenario, index }) => (
            <SubmissionInstanceLabel
              apiKey={apiKey}
              scenarioId={scenario}
              index={index}
              slice={slice}
            />
          ),
          fallback: renderPlaceholder,
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
            <SubmissionInstanceContext
              apiKey={apiKey}
              scenarioId={row.scenario}
              index={row.index}
              slice={slice}
              render={({ submission, isLoading }) =>
                !isLoading && (
                  <Bar
                    label={
                      {
                        valid: (
                          <DoneOutlined color="success" fontSize="small" />
                        ),
                        invalid: (
                          <CloseOutlined color="error" fontSize="small" />
                        ),
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
                      }[submission?.validation?.outcome] ?? {
                        color: "success.main",
                        value: 0,
                        label: "Pending",
                      },
                    ]}
                  />
                )
              }
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
              slice={slice}
              render={({ isLoading, submission, instance }) =>
                isLoading ? (
                  ""
                ) : (
                  <Typography
                    variant="body2"
                    sx={{
                      overflow: "hidden",
                      width: " 100%",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {getSubmissionInfoText(submission, instance)}
                  </Typography>
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
        {[
          { label: "Valid", key: "valid" },
          { label: "Invalid", key: "invalid" },
          { label: "Duplicate", key: "outdated" },
          { label: "All", key: "total" },
        ].map(({ label, key }) => {
          const selected = key === slice;
          return (
            <Chip
              sx={{
                pl: 0.25,
                border: selected
                  ? (t) => `1px ${alpha(t.palette.primary.main, 0.2)}`
                  : (t) => `1px solid ${t.palette.divider}`,
                bgcolor: selected
                  ? (t) => alpha(t.palette.primary.main, 0.2)
                  : undefined,
              }}
              icon={
                <Collapse in={selected} orientation="horizontal">
                  <DoneOutlined
                    fontSize="small"
                    color={selected ? "primary" : undefined}
                  />
                </Collapse>
              }
              label={label}
              variant="outlined"
              onClick={() => setSlice(key as keyof SummarySlice)}
            />
          );
        })}
      </Stack>
      <TreeDataGrid
        initialState={{ pagination: { paginationModel: { pageSize: 50 } } }}
        getChildren={(row) =>
          disambiguate(row, {
            map: (row) => arrayFallback(row.scenarios, placeholder(row.id)),
            scenario: (row) =>
              arrayFallback(
                times(row.count[slice], (i) => ({
                  id: `${row.id}-${i}`,
                  scenario: row.id,
                  index: i,
                })),
                placeholder(row.id)
              ),
            instance: () => undefined,
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
                slice,
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
