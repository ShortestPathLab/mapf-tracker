import { Box, Skeleton, Stack } from "@mui/material";
import { cellRendererText } from "components/data-grid";
import { GridColDef } from "components/data-grid/DataGrid";
import { Dot } from "components/Dot";
import { Item } from "components/Item";
import Enter from "components/transitions/Enter";
import {
  TreeDataGrid,
  useBooleanMap,
} from "components/tree-data-grid/TreeDataGrid";
import { useSurface } from "components/surface/useSurface";
import { capitalize, startCase, times } from "lodash";
import { Arrow } from "pages/submission-summary/table/Arrow";
import { MapLabel } from "pages/submission-summary/table/MapLabel";
import { disambiguate, Model } from "pages/submission-summary/table/Model";
import { ScenarioLabel } from "pages/submission-summary/table/ScenarioLabel";
import { useAlgorithmSummaryQuery } from "queries/useAlgorithmQuery";
import { InstanceDetails } from "./InstanceDetails";
import { SubmissionInstanceContext } from "./SubmissionInstanceContextParams";
import { SubmissionInstanceLabel } from "./SubmissionInstanceLabel";

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

export function Table({ algorithm }: { algorithm?: string }) {
  const [expanded, setExpanded] = useBooleanMap();
  const { data, isLoading } = useAlgorithmSummaryQuery(algorithm);

  const { dialog, open } = useSurface(InstanceDetails, {
    title: "Submission instance details",
  });

  const slice = "total";
  const columns: GridColDef<Model>[] = [
    {
      field: "Icon",
      width: 48,
      renderCell: ({ row }) =>
        disambiguate(row, {
          map: (row) => <Arrow open={expanded[row.id]} />,
          scenario: (row) => (
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
      headerName: "Submissions",
      minWidth: 220,
      flex: 1,
      renderCell: ({ row }) =>
        disambiguate(row, {
          map: (row) => (
            <MapLabel mapId={row.id} count={row.count[slice] ?? 0} />
          ),
          scenario: (row) => (
            <Stack sx={{ pl: 2 }}>
              <ScenarioLabel
                scenarioId={row.id}
                count={row.count[slice] ?? 0}
              />
            </Stack>
          ),
          instance: ({ scenario, index }) => (
            <Stack sx={{ pl: 4 }}>
              <SubmissionInstanceLabel
                index={index}
                scenario={scenario}
                algorithm={algorithm}
              />
            </Stack>
          ),
          fallback: renderPlaceholder,
        }),
    },
    ...(
      [
        { cost: "solution_cost", best: "best_solution" },
        { cost: "lower_cost", best: "best_lower" },
      ] as const
    ).map(({ cost, best }) => ({
      fold: true,
      flex: 1,
      field: cost,
      headerName: capitalize(startCase(cost)),
      minWidth: 90,
      renderCell: ({ row }) =>
        disambiguate(row, {
          instance: ({ scenario, index }) => {
            return (
              <SubmissionInstanceContext
                algorithm={algorithm}
                scenario={scenario}
                index={index}
              >
                {({ current, instance, isLoading }) =>
                  cellRendererText({
                    formattedValue: isLoading ? (
                      <Skeleton variant="text" width={100} />
                    ) : (
                      <>
                        {current?.[cost]?.toLocaleString?.() ?? "N/A"}
                        {current?.[best] ? (
                          <>
                            <Dot sx={{ bgcolor: "success.main", ml: 2 }} />
                            <Box
                              component="span"
                              sx={{ color: "text.secondary" }}
                            >
                              {capitalize(startCase(best))}
                            </Box>
                          </>
                        ) : (
                          <>
                            <Dot sx={{ bgcolor: "warning.main", ml: 2 }} />
                            <Box
                              component="span"
                              sx={{ color: "text.secondary" }}
                            >
                              Best is {instance?.[cost]}
                            </Box>
                          </>
                        )}
                      </>
                    ),
                  })
                }
              </SubmissionInstanceContext>
            );
          },
        }),
    })),
  ];
  return (
    <>
      <TreeDataGrid
        isLoading={isLoading}
        clickable
        expanded={expanded}
        onRowClick={({ row }) =>
          disambiguate(row, {
            instance: ({ scenario, index }) =>
              open({ scenario, index, algorithm }),
          })
        }
        onExpandedChange={setExpanded}
        rows={data?.maps}
        columns={columns}
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
      />
      {dialog}
    </>
  );
}
