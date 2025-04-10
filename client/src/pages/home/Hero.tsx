import {
  Box,
  Button,
  CardActionArea,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {
  CompletionByAlgorithmChartCard,
  formatLargeNumber,
} from "components/charts/CompletionByAlgorithmChart";
import { TotalSolvedClosedDonutChart } from "components/charts/TotalSolvedClosedChart";
import { Scroll } from "components/dialog/Scrollbars";
import { useLg, useMd, useXs } from "components/dialog/useSmallDisplay";
import { Item } from "components/Item";
import { PreviewCard } from "components/PreviewCard";
import { useNavigate } from "hooks/useNavigation";
import { Grid } from "layout";
import { find, map } from "lodash";
import { AlgorithmPreview } from "pages/algorithms/AlgorithmPreview";
import { ArticleCard } from "pages/docs/ArticleCard";
import { pages } from "pages/docs/pages";
import { Tip } from "pages/home/Tip";
import pluralize from "pluralize";
import { useAlgorithmDetailsData } from "queries/useAlgorithmQuery";
import { useMapsData } from "queries/useMapQuery";
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
  } = useMapsData();
  const {
    data: algorithms = [
      {
        algo_name: "--",
        authors: "--",
      },
    ],
  } = useAlgorithmDetailsData();

  const renderHeader = (
    label: string,
    description: string,
    buttonLabel: string,
    onClick: () => void
  ) => (
    <Stack
      direction="row"
      sx={{
        mt: 1,
        gap: 2,
        justifyContent: "space-between",
        alignItems: "flex-end",
      }}
    >
      <Stack sx={{ overflow: "hidden" }}>
        <Typography>{label}</Typography>
        <Typography
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          color="text.secondary"
          variant="subtitle2"
        >
          {description}
        </Typography>
      </Stack>
      <Button onClick={onClick} sx={{ minWidth: "max-content" }}>
        {buttonLabel}
      </Button>
    </Stack>
  );

  return (
    <Stack
      sx={{
        gap: 4,
        m: xs ? 0 : md ? 2 : 4,
        maxWidth: "100%",
      }}
    >
      <Tip />
      <Stack
        direction={md ? "column" : "row"}
        sx={{
          gap: lg ? 2 : 3,
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
          {renderHeader(
            "Trends",
            "Explore trends in the dataset",
            "See more trends",
            () => navigate("/benchmarks", { t: "analysis" })
          )}
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
              sx={{ minHeight: 480 }}
              primaryLabel="Completion by submission"
              columns={1}
              height="100%"
              secondaryLabel="Compare instances closed and solved across submissions"
            />
          </Stack>
          {renderHeader(
            "Benchmarks",
            "Browse benchmarks and solutions via maps",
            "See all benchmarks",
            () => navigate("/benchmarks")
          )}

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
                          {`${m.map_size}, ${pluralize(
                            "instance",
                            m.instances ?? 0,
                            true
                          )}`}
                          <br />
                          {`${m.proportion_instances_solved * 100}% solved`}
                        </Box>
                      }
                    />
                  </Stack>
                </CardActionArea>
              ))}
            </Stack>
          </Scroll>
          {renderHeader(
            "Submissions",
            "These are the algorithms researchers have submitted solutions for",
            "See all submissions",
            () => navigate("/submissions")
          )}
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
                      icon={<AlgorithmPreview id={m._id} />}
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
                          <br />
                          {`${formatLargeNumber(m.instances ?? 0)} ${pluralize(
                            "instance",
                            m.instances ?? 0
                          )} submitted`}
                        </Box>
                      }
                    />
                  </Stack>
                </CardActionArea>
              ))}
            </Stack>
          </Scroll>
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
          <Typography sx={{ mt: 0.5 }}>Try these</Typography>
          <Grid width={420} gap={2}>
            {map(
              [
                {
                  label: "See a solution for 4000 agents on ORZ 900 D",
                  description:
                    "Multi-agent pathfinding is difficult. We have algorithms that can solve this problem, yet you can clearly where there's room for improvement.",
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
          mx: 0,
        }}
      >
        {children}
      </Stack>
    </Stack>
  );
}

// Show plan for big gap
//
