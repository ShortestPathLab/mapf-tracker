import {
  Avatar,
  Box,
  Button,
  Divider,
  Link,
  Skeleton,
  Stack,
  Typography,
  TypographyProps,
} from "@mui/material";
import { GridChartCard } from "components/charts/GridChartCard";
import { cellRendererText } from "components/data-grid";
import { GridColDef } from "components/data-grid/DataGrid";
import { useSm } from "components/dialog/useSmallDisplay";
import { Dot } from "components/Dot";
import { DownloadBar } from "components/DownloadBar";
import { FlatCard } from "components/FlatCard";
import { Item } from "components/Item";
import { PreviewCard } from "components/PreviewCard";
import Enter from "components/transitions/Enter";
import {
  TreeDataGrid,
  useBooleanMap,
} from "components/tree-data-grid/TreeDataGrid";
import { Instance } from "core/types";
import { DialogContentProps, useDialog } from "hooks/useDialog";
import { useNavigate } from "hooks/useNavigation";
import { Grid } from "layout";
import { GalleryLayout } from "layout/GalleryLayout";
import { useTop } from "layout/TabBar";
import { capitalize, startCase, times } from "lodash";
import { AlgorithmByMapChart } from "pages/benchmarks-root-level/charts/AlgorithmByMapChart";
import { AlgorithmByMapTypeChart } from "pages/benchmarks-root-level/charts/AlgorithmByMapTypeChart";

import { Arrow } from "pages/submission-summary/table/Arrow";
import { MapLabel } from "pages/submission-summary/table/MapLabel";
import { disambiguate, Model } from "pages/submission-summary/table/Model";
import { ScenarioLabel } from "pages/submission-summary/table/ScenarioLabel";
import pluralize from "pluralize";
import {
  SubmissionInfo,
  useAlgorithmDetailData,
  useAlgorithmScenarioQuery,
  useAlgorithmSummaryQuery,
} from "queries/useAlgorithmQuery";
import { useInstanceData } from "queries/useInstanceQuery";
import { ReactNode, useRef } from "react";
import { matchPath, redirect } from "react-router-dom";
import { formatDate } from "utils/format";

type SubmissionInstanceContextParams = {
  index?: number;
  scenario?: string;
  algorithm?: string;
};

export function SubmissionInstanceContext({
  index = 0,
  scenario,
  algorithm,
  children,
}: SubmissionInstanceContextParams & {
  children: (r: {
    isLoading?: boolean;
    current?: SubmissionInfo;
    instance?: Instance;
  }) => ReactNode;
}) {
  const { data, isLoading } = useAlgorithmScenarioQuery(algorithm, scenario);
  const current = data?.[index];
  const { data: instance, isLoading: isInstanceLoading } = useInstanceData(
    current?.instance_id
  );
  return children({
    current,
    instance,
    isLoading: isLoading || isInstanceLoading,
  });
}

function InstanceLabel({ id }: { id?: string }) {
  const { data: instance, isLoading } = useInstanceData(id);
  return (
    <Enter axis="x" in={!isLoading}>
      <Stack
        direction="row"
        sx={{
          gap: 2,
          width: 320,
          alignItems: "center",
        }}
      >
        <PreviewCard instance={id} />
        <Item primary={pluralize("agent", instance?.agents ?? 0, true)} />
      </Stack>
    </Enter>
  );
}

function SubmissionInstanceLabel(props: SubmissionInstanceContextParams) {
  return (
    <SubmissionInstanceContext {...props}>
      {({ isLoading, current }) => (
        <Enter axis="x" in={!isLoading}>
          <Stack
            direction="row"
            sx={{
              gap: 2,
              alignItems: "center",
            }}
          >
            <PreviewCard instance={current?.instance_id} />
            <Item
              primary={pluralize("agent", current?.agents ?? 0, true)}
              secondary={formatDate(current?.date)}
            />
          </Stack>
        </Enter>
      )}
    </SubmissionInstanceContext>
  );
}

function StickyTitle({ children, ...props }: TypographyProps) {
  const sm = useSm();
  const ref = useRef<HTMLElement>(null);
  const isTop = useTop(ref);
  return (
    <Box
      ref={ref}
      sx={{
        position: "sticky",
        top: 0,
        zIndex: (t) => t.zIndex.appBar - 1,
        py: 2,
        my: -2,
        px: 3,
        mx: -3,
        bgcolor: isTop ? "background.paper" : "background.default",
      }}
    >
      <Typography
        variant={sm ? "subtitle2" : "subtitle1"}
        color="text.secondary"
        {...props}
      >
        {children}
      </Typography>
    </Box>
  );
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

function InstanceDetails({
  scenario,
  index,
  algorithm,
}: SubmissionInstanceContextParams & DialogContentProps) {
  const { data: algorithmInfo } = useAlgorithmDetailData(algorithm);
  const navigate = useNavigate();
  return (
    <SubmissionInstanceContext
      algorithm={algorithm}
      scenario={scenario}
      index={index}
    >
      {({ current, instance }) => {
        return (
          <Stack sx={{ gap: 4, width: 720, maxWidth: "100%" }}>
            <Stack sx={{ gap: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Algorithm
              </Typography>
              <Item
                icon={<AlgorithmPreview id={algorithm} />}
                primary={algorithmInfo?.algo_name}
                secondary={algorithmInfo?.authors}
              />
            </Stack>
            <Stack sx={{ gap: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Instance
              </Typography>
              <Stack>
                <MapLabel mapId={instance?.map_id} />
                <ScenarioLabel scenarioId={instance?.scen_id} />
                <InstanceLabel id={instance?.id} />
              </Stack>
            </Stack>
            <Stack sx={{ gap: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Results
              </Typography>
              <Item
                invert
                primary={formatDate(current?.date)}
                secondary={"Date submitted"}
              />
              <Grid width={120}>
                {["solution_cost", "lower_cost"].map((cost) => (
                  <Item
                    invert
                    key={cost}
                    primary={current?.[cost] ?? "N/A"}
                    secondary={capitalize(startCase(cost))}
                  />
                ))}
              </Grid>
              <Grid width={120}>
                {["best_solution", "best_lower"].map((cost) => (
                  <Item
                    invert
                    key={cost}
                    primary={
                      current?.[cost] ? (
                        <>
                          <Dot sx={{ bgcolor: "success.main" }} />
                          Yes
                        </>
                      ) : (
                        <>
                          <Dot
                            sx={{
                              bgcolor: "warning.main",
                            }}
                          />
                          No
                        </>
                      )
                    }
                    secondary={capitalize(startCase(cost))}
                  />
                ))}
              </Grid>
            </Stack>{" "}
            <Stack sx={{ gap: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                State-of-the-art for this instance
              </Typography>
              <Grid width={120}>
                {["solution_cost", "lower_cost"].map((cost) => (
                  <Item
                    invert
                    key={cost}
                    primary={instance?.[cost] ?? "N/A"}
                    secondary={capitalize(startCase(cost))}
                  />
                ))}
              </Grid>
            </Stack>
            <Button
              variant="contained"
              onClick={() =>
                navigate("/visualization", {
                  instanceId: instance?.id,
                  solutionId: instance?.solution_path_id,
                  source: "submitted",
                })
              }
            >
              See this instance in benchmarks
            </Button>
          </Stack>
        );
      }}
    </SubmissionInstanceContext>
  );
}

export function Table({ algorithm }: { algorithm?: string }) {
  const [closed, setClosed] = useBooleanMap();
  const { data, isLoading } = useAlgorithmSummaryQuery(algorithm);

  const { dialog, open } = useDialog(InstanceDetails, {
    padded: true,
    title: "Submission instance details",
  });

  const slice = "total";
  const columns: GridColDef<Model>[] = [
    {
      field: "Icon",
      width: 48,
      renderCell: ({ row }) =>
        disambiguate(row, {
          map: (row) => <Arrow open={!closed[row.id]} />,
          scenario: (row) => <Arrow sx={{ ml: 2 }} open={!closed[row.id]} />,
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
        initialState={{ pagination: { paginationModel: { pageSize: 50 } } }}
        isLoading={isLoading}
        clickable
        expanded={closed}
        onRowClick={({ row }) =>
          disambiguate(row, {
            instance: ({ scenario, index }) =>
              open({ scenario, index, algorithm }),
          })
        }
        onExpandedChange={setClosed}
        rows={data?.maps}
        columns={columns}
        defaultExpanded
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

export function AlgorithmPreview({ id }: { id?: string }) {
  return (
    <Avatar src={`https://api.dicebear.com/9.x/identicon/svg?seed=${id}`} />
  );
}

export function AlgorithmPage() {
  const { params } = matchPath("/submissions/:id", window.location.pathname);

  const { data } = useAlgorithmDetailData(params?.id);

  if (!params?.id) redirect("/");

  return (
    <GalleryLayout
      sidebarWidth={420}
      cover={<AlgorithmPreview id={data?.id} />}
      title={data?.algo_name}
      description={data?.authors}
      path={[
        { name: "Home", url: "/" },
        { name: "Submissions", url: "/submissions" },
      ]}
      items={[
        ...(data?.github
          ? [
              {
                value: <Link href={data.github}>{data.github}</Link>,
                label: "GitHub",
              },
            ]
          : []),
        { value: data?.papers, label: "Papers" },
        { value: data?.instances_solved, label: "Instances solved" },
        { value: data?.instances_closed, label: "Instances closed" },
        { value: data?.best_solution, label: "Best solution" },
        { value: data?.best_lower, label: "Best lower-bound" },
        { value: data?.comments, label: "Comments" },
      ]}
    >
      <DownloadBar />
      <Divider />
      <StickyTitle>Algorithm performance</StickyTitle>
      <Stack sx={{ gap: 2 }}>
        <GridChartCard
          primaryLabel="Completion by map type"
          secondaryLabel="Instances closed and solved across map types"
          height={560}
          content={<AlgorithmByMapTypeChart algorithm={data?.id} />}
        />
        <GridChartCard
          primaryLabel="Completion by map"
          secondaryLabel="Instances closed and solved across maps"
          height={560}
          content={<AlgorithmByMapChart algorithm={data?.id} />}
        />
      </Stack>
      <StickyTitle>Submitted instances</StickyTitle>
      <FlatCard>
        <Table algorithm={data?.id} />
      </FlatCard>
    </GalleryLayout>
  );
}
