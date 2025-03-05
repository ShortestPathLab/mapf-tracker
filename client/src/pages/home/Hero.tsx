import { Stack, Typography } from "@mui/material";
import { CompletionByAlgorithmChartCard } from "components/charts/CompletionByAlgorithmChart";
import { GridChartCard } from "components/charts/GridChartCard";
import { RecentActivityChart } from "components/charts/RecentActivityChart";
import { TotalSolvedClosedChart } from "components/charts/TotalSolvedClosedChart";
import { Grid } from "layout";
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
        <Grid
          width={460}
          sx={{
            gap: 2,
          }}
        >
          <Stack
            sx={{
              height: "100%",
              gridColumns: "span 1",
              gap: 2,
              "> *": { flex: 1 },
            }}
          >
            <TotalSolvedClosedChart columns={1} sx={{ minHeight: 130 }} />
            <RecentActivityChart columns={1} sx={{ minHeight: 140 }} />
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
        </Grid>
      </Stack>
      {/* <Stack sx={{ gap: 2, my: 1 }}>
        <Typography color="text.secondary">Browse maps</Typography>
        <Table />
      </Stack> */}
    </Stack>
  );
}
