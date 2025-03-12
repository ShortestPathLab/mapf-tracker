import { Stack, Typography } from "@mui/material";
import { CompletionByAgentCountChartCard } from "components/charts/CompletionByAgentCountChart";
import { CompletionByAlgorithmChartCard } from "components/charts/CompletionByAlgorithmChart";
import { GridChartCard } from "components/charts/GridChartCard";
import { RecentActivityChart } from "components/charts/RecentActivityChart";
import { TotalSolvedClosedChart } from "components/charts/TotalSolvedClosedChart";
import { useMd } from "components/dialog/useSmallDisplay";
import { useNavigate } from "hooks/useNavigation";
import { Grid } from "layout";
import { find, map } from "lodash";
import { MapProportionChart } from "pages/benchmarks-root-level/charts/MapProportionChart";
import { ArticleCard } from "pages/docs/ArticleCard";
import { pages } from "pages/docs/pages";
import { Tip } from "pages/home/Tip";

export default function Hero() {
  const navigate = useNavigate();
  const md = useMd();
  return (
    <Stack sx={{ gap: 4 }}>
      <Tip />
      {/* <Stack
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          bgcolor: "background.paper",
          py: 2,
          my: -2,
        }}
      >
        <QuickNavigationBar />
      </Stack> */}
      <Stack
        direction={md ? "column" : "row"}
        sx={{ gap: 2, alignItems: "flex-start" }}
      >
        <Stack sx={{ gap: 2, my: 1 }}>
          <Typography color="text.secondary">Trends</Typography>
          <Stack
            direction="row"
            sx={{
              flexWrap: "wrap",
              gap: 2,
              "> *": {
                flex: "1 1 0",
                width: "100%",
                minWidth: 380,
              },
            }}
          >
            <Stack
              sx={{
                gap: 2,
                flex: 1,
              }}
            >
              <TotalSolvedClosedChart sx={{ minHeight: 130, flex: 1 }} />
              <RecentActivityChart sx={{ minHeight: 140, flex: 2 }} />
            </Stack>
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
            <CompletionByAlgorithmChartCard
              sx={{ minHeight: 420 }}
              primaryLabel="Completion by submission"
              columns={1}
              height="100%"
              secondaryLabel="Compare instances closed and solved across submissions"
            />
          </Stack>
        </Stack>
        <Stack
          sx={{
            gap: 2,
            my: 1,
            minWidth: 320,
            width: md ? "100%" : 0,
            position: "sticky",
            top: 16,
            height: "fit-content",
          }}
        >
          <Typography color="text.secondary">Highlights</Typography>

          <Grid width={420} gap={2}>
            {map(
              [
                {
                  label: "See a solution for ORZ Random 25",
                  description:
                    "Find out why multi-agent pathfinding is so difficult.",
                  value:
                    "/visualization?mapId=63761f265d814f08ecdbf3bf&reason=unknown&scenId=63761f275d814f08ecdbf99e&instanceId=63761f2c5d814f08ecded10c&solutionId=641131c4a77d7971655b98c0&source=submitted",
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
    </Stack>
  );
}

// Show plan for big gap
//
