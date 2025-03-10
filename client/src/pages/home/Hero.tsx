import { Stack, Typography } from "@mui/material";
import { CompletionByAgentCountChartCard } from "components/charts/CompletionByAgentCountChart";
import { CompletionByAlgorithmChartCard } from "components/charts/CompletionByAlgorithmChart";
import { GridChartCard } from "components/charts/GridChartCard";
import { RecentActivityChart } from "components/charts/RecentActivityChart";
import { TotalSolvedClosedChart } from "components/charts/TotalSolvedClosedChart";
import { MapProportionChart } from "pages/benchmarks-root-level/charts/MapProportionChart";
import { Tip } from "pages/home/Tip";

export default function Hero() {
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
              minWidth: 340,
            },
          }}
        >
          <Stack
            sx={{
              gap: 2,
              "> *": { flex: 1 },
              flex: 1,
            }}
          >
            <TotalSolvedClosedChart sx={{ minHeight: 130 }} />
            <RecentActivityChart sx={{ minHeight: 140 }} />
          </Stack>
          <CompletionByAlgorithmChartCard
            sx={{ minHeight: 380 }}
            primaryLabel="Completion by submission"
            columns={1}
            height="100%"
            secondaryLabel="Compare instances closed and solved across submissions"
          />
          <GridChartCard
            sx={{ minHeight: 380 }}
            columns={1}
            height="100%"
            primaryLabel="Completion by map type"
            content={<MapProportionChart />}
            secondaryLabel="Instances closed and solved across map types"
          />
          <CompletionByAgentCountChartCard
            sx={{ minHeight: 380 }}
            columns={1}
            height="100%"
            primaryLabel="Completion by agent count"
            secondaryLabel="Instances solved and closed across agent count"
          />
        </Stack>
      </Stack>
      {/* <Stack sx={{ gap: 2, my: 1 }}>
        <Typography color="text.secondary">Browse maps</Typography>
        <Table />
      </Stack> */}
    </Stack>
  );
}
