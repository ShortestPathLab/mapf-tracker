import { Stack, Typography } from "@mui/material";
import { CompletionByAgentCountChartCard } from "components/charts/CompletionByAgentCountChart";
import { CompletionByAlgorithmChartCard } from "components/charts/CompletionByAlgorithmChart";
import { GridChartCard } from "components/charts/GridChartCard";
import { RecentActivityChart } from "components/charts/RecentActivityChart";
import { TotalSolvedClosedChart } from "components/charts/TotalSolvedClosedChart";
import { useLg, useMd } from "components/dialog/useSmallDisplay";
import { useNavigate } from "hooks/useNavigation";
import { Grid } from "layout";
import { find, map } from "lodash";
import { MapProportionChart } from "pages/benchmarks-root-level/charts/MapProportionChart";
import { ArticleCard } from "pages/docs/ArticleCard";
import { pages } from "pages/docs/pages";
import { Tip } from "pages/home/Tip";
import { QuickNavigation } from "./QuickNavigation";
import { ReactNode } from "react";

const TEMP_HARDCODED_SOLUTION_PATH =
  "/visualization?mapId=63761f265d814f08ecdbf3bf&reason=unknown&scenId=63761f275d814f08ecdbf96d&instanceId=63761f275d814f08ecdc0a42&solutionId=64111c7aa77d79716559c10f&source=submitted";
export default function Hero({ children }: { children?: ReactNode }) {
  const navigate = useNavigate();
  const md = useMd();
  const lg = useLg();
  return (
    <Stack sx={{ gap: 4 }}>
      <Tip />
      <Stack
        direction={md ? "column" : "row"}
        sx={{ gap: lg ? 2 : 6, mx: lg ? 0 : 4, alignItems: "flex-start" }}
      >
        <Stack sx={{ gap: 2, my: 1 }}>
          <Typography color="text.secondary">Jump to</Typography>
          <Stack>
            <QuickNavigation />
          </Stack>
          <Typography color="text.secondary" sx={{ pt: 2 }}>
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
            <Stack
              sx={{
                gap: 2,
                flex: 1,
              }}
            >
              <TotalSolvedClosedChart sx={{ minHeight: 130, flex: 1 }} />
              <RecentActivityChart sx={{ minHeight: 200, flex: 2 }} />
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
            position: md ? "static" : "sticky",
            top: 16,
            height: "fit-content",
          }}
        >
          <Typography color="text.secondary">Try these</Typography>
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
          mx: lg ? 0 : 4,
        }}
      >
        {children}
      </Stack>
    </Stack>
  );
}

// Show plan for big gap
//
