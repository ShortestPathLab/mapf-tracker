import {
  Avatar,
  Box,
  Button,
  CardActionArea,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { CompletionByAgentCountChartCard } from "components/charts/CompletionByAgentCountChart";
import { CompletionByAlgorithmChartCard } from "components/charts/CompletionByAlgorithmChart";
import { GridChartCard } from "components/charts/GridChartCard";
import { TotalSolvedClosedDonutChart } from "components/charts/TotalSolvedClosedChart";
import { Scroll } from "components/dialog/Scrollbars";
import { useLg, useMd, useXs } from "components/dialog/useSmallDisplay";
import { Item } from "components/Item";
import { PreviewCard } from "components/PreviewCard";
import { useNavigate } from "hooks/useNavigation";
import { Grid } from "layout";
import { find, map } from "lodash";
import { MapProportionChart } from "pages/benchmarks-root-level/charts/MapProportionChart";
import { ArticleCard } from "pages/docs/ArticleCard";
import { pages } from "pages/docs/pages";
import { Tip } from "pages/home/Tip";
import pluralize from "pluralize";
import { useAlgorithmDetailsData } from "queries/useAlgorithmQuery";
import { useBenchmarksData } from "queries/useBenchmarksQuery";
import { ReactNode } from "react";
import { paper } from "theme";

const TEMP_HARDCODED_SOLUTION_PATH =
  "/visualization?mapId=63761f265d814f08ecdbf3bf&reason=unknown&scenId=63761f275d814f08ecdbf96d&instanceId=63761f275d814f08ecdc0a42&solutionId=64111c7aa77d79716559c10f&source=submitted";

export default function Hero({ children }: { children?: ReactNode }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const xs = useXs();
  const md = useMd();
  const lg = useLg();
  const {
    data: maps = [
      {
        map_name: "--",
        map_size: "--",
        proportion_instances_solved: 0,
        instances: 0,
      },
    ],
  } = useBenchmarksData();
  const {
    data: algorithms = [
      {
        algo_name: "--",
        authors: "--",
      },
    ],
  } = useAlgorithmDetailsData();
  return (
    <Stack sx={{ gap: 4, m: xs ? 0 : md ? 2 : 4, maxWidth: "100%" }}>
      <Tip />
      <Stack
        direction={md ? "column" : "row"}
        sx={{
          gap: lg ? 2 : 3,
          mx: lg ? 0 : 0,
          alignItems: "flex-start",
          maxWidth: "100%",
        }}
      >
        <Stack
          sx={{
            gap: 2,
            my: 1,
            flex: 1,
            maxWidth: "100%",
            width: md ? "100%" : 0,
          }}
        >
          <Stack
            direction="row"
            sx={{
              mb: -1,
              gap: 2,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography color="text.secondary">Benchmarks</Typography>
            <Button onClick={() => navigate("/benchmarks")}>
              See all benchmarks
            </Button>
          </Stack>
          <Scroll x fadeX style={{ width: "calc(100% + 8px)", margin: -8 }}>
            <Stack
              direction="row"
              sx={{
                "> *": { minWidth: 320, width: 320, flex: 0 },
                gap: 2,
                p: 1,
                justifyContent: "flex-start",
              }}
            >
              {maps?.map?.((m) => (
                <CardActionArea
                  disabled={!m.id}
                  onClick={() => navigate(`/scenarios`, { mapId: m.id })}
                  key={m.id}
                >
                  <Stack sx={{ ...paper(1), p: 2 }}>
                    <Item
                      icon={
                        <PreviewCard
                          map={m.id}
                          palette={{ obstacle: theme.palette.text.primary }}
                        />
                      }
                      primary={m.map_name}
                      secondary={
                        <Box
                          component="span"
                          sx={{
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                          }}
                        >
                          <span>
                            {`${m.map_size}, ${pluralize(
                              "instance",
                              m.instances ?? 0,
                              true
                            )}`}
                          </span>
                          <br />
                          <span>
                            {`${m.proportion_instances_solved * 100}% solved`}
                          </span>
                        </Box>
                      }
                    />
                  </Stack>
                </CardActionArea>
              ))}
            </Stack>
          </Scroll>
          <Stack
            direction="row"
            sx={{
              mb: -1,
              gap: 2,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography color="text.secondary">Submissions</Typography>
            <Button onClick={() => navigate("/submissions")}>
              See all submissions
            </Button>
          </Stack>
          <Scroll x fadeX style={{ width: "calc(100% + 8px)", margin: -8 }}>
            <Stack
              direction="row"
              sx={{
                "> *": { minWidth: 300, width: 300, flex: 0 },
                gap: 2,
                p: 1,
                justifyContent: "flex-start",
              }}
            >
              {algorithms?.map?.((m) => (
                <CardActionArea
                  disabled={!m.id}
                  sx={{ borderRadius: 1, minHeight: 0, height: "fit-content" }}
                  onClick={() => navigate(`/submissions/${m._id}`)}
                  key={m._id}
                >
                  <Stack sx={{ ...paper(1), p: 2 }}>
                    <Item
                      icon={
                        <Avatar
                          sx={{ mr: 1.5 }}
                          src={`https://api.dicebear.com/9.x/identicon/svg?seed=${m._id}`}
                        />
                      }
                      primary={m.algo_name}
                      secondary={
                        <Box
                          sx={{
                            width: "100%",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {m.authors}
                        </Box>
                      }
                    />
                  </Stack>
                </CardActionArea>
              ))}
            </Stack>
          </Scroll>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Trends
          </Typography>
          <Stack
            direction="row"
            sx={{
              flexWrap: "wrap",
              gap: 2,
              "> *": {
                flex: "1 1 0",
                width: "100%",
                minWidth: "min(100%, 380px)",
              },
            }}
          >
            <TotalSolvedClosedDonutChart sx={{ minHeight: 320, flex: 1 }} />
            <CompletionByAlgorithmChartCard
              sx={{ minHeight: 420 }}
              primaryLabel="Completion by submission"
              columns={1}
              height="100%"
              secondaryLabel="Compare instances closed and solved across submissions"
            />
            <GridChartCard
              sx={{ minHeight: 420 }}
              columns={1}
              height="100%"
              primaryLabel="Completion by domain"
              content={<MapProportionChart />}
              secondaryLabel="Instances closed and solved across domains"
            />
            <CompletionByAgentCountChartCard
              sx={{ minHeight: 420 }}
              columns={1}
              height="100%"
              primaryLabel="Completion by agent count"
              secondaryLabel="Instances solved and closed across agent count"
            />
          </Stack>
        </Stack>
        <Stack
          sx={{
            gap: 2,
            my: 1,
            minWidth: 320,
            width: md ? "100%" : 0,
            position: md ? "static" : "sticky",
            top: 16,
            height: "fit-content",
          }}
        >
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Try these
          </Typography>
          <Grid width={420} gap={2}>
            {map(
              [
                {
                  label: "See a solution for 4000 agents on ORZ 900 D",
                  description:
                    "Multi-agent pathfinding is difficult. LaCAM solves this problem instance, yet you can clearly where there's room for improvement.",
                  value: TEMP_HARDCODED_SOLUTION_PATH,
                  icon: undefined,
                  content: undefined,
                  cover: "/assets/visualisation.png",
                },
                ...[find(pages(), { value: "system-demo" })].map((v) => ({
                  ...v,
                  value: `/docs/${v.value}`,
                })),
              ],
              (page) => (
                <ArticleCard
                  page={page}
                  onClick={() => navigate(page?.value)}
                />
              )
            )}
          </Grid>
        </Stack>
      </Stack>
      <Stack
        direction="column"
        sx={{
          gap: 2,
          mb: 4,
          mx: lg ? 0 : 0,
        }}
      >
        {children}
      </Stack>
    </Stack>
  );
}

// Show plan for big gap
//
