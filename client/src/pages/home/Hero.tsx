import {
  Autocomplete,
  Avatar,
  Box,
  BoxProps,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Item } from "components/Item";
import { Benchmark } from "core/types";
import { useNavigate } from "hooks/useNavigation";
import { Grid } from "layout";
import { map } from "lodash";
import { MapLevelLocationState } from "pages/benchmarks-map-level/MapLevelLocationState";
import Table from "pages/benchmarks-root-level/Table";
import { MapProportionChart } from "pages/benchmarks-root-level/charts/MapProportionChart";
import { MapLabel } from "pages/submission-summary/table/MapLabel";
import { useAlgorithmsData } from "queries/useAlgorithmQuery";
import { useBenchmarksData } from "queries/useBenchmarksQuery";
import { CompletionByAgentCountChartCard } from "./CompletionByAgentCountChart";
import { CompletionByAlgorithmChartCard } from "./CompletionByAlgorithmChart";
import { GridChartCard } from "./GridChartCard";
import { RecentActivityChart } from "./RecentActivityChart";
import { TotalSolvedClosedChart } from "./TotalSolvedClosedChart";

function QuickNavigationBar() {
  const { data: maps = [] } = useBenchmarksData();
  const { data: algorithms = [] } = useAlgorithmsData();
  const navigate = useNavigate();
  return (
    <Autocomplete
      options={[
        ...map(maps, (source) => ({
          source,
          type: "map",
          name: source.map_name,
        })),
        ...map(algorithms, (source) => ({
          source,
          type: "algorithm",
          name: source.algo_name,
        })),
      ]}
      autoHighlight
      getOptionLabel={(d) => d.name}
      onChange={(_, v, reason) => {
        if (reason === "blur") return;
        switch (v?.type) {
          case "algorithm":
            navigate("/submissions");
            break;
          case "map":
            {
              const m = v.source as Benchmark;
              navigate<MapLevelLocationState>("/scenarios", {
                mapId: m.id,
                mapName: m.map_name,
              });
            }
            break;
        }
      }}
      renderOption={({ key, ...props }, d) => (
        <Box key={key} {...(props as unknown as BoxProps)}>
          {d.type === "map" ? (
            <MapLabel mapId={(d.source as Benchmark).id} />
          ) : (
            <Item
              icon={
                <Avatar
                  sx={{ mr: 1 }}
                  src={`https://api.dicebear.com/9.x/identicon/svg?seed=${d.name}`}
                />
              }
              primary={d.name}
              secondary="Algorithm"
            />
          )}
        </Box>
      )}
      renderInput={(props) => (
        <TextField
          label="Go to a benchmark, algorithm, or map"
          variant="filled"
          fullWidth
          {...props}
        />
      )}
    />
  );
}

export default function Hero() {
  return (
    <Stack sx={{ gap: 4 }}>
      <Stack
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          bgcolor: "background.default",
          py: 2,
          my: -2,
        }}
      >
        <QuickNavigationBar />
      </Stack>
      <Stack sx={{ gap: 2, my: 1 }}>
        <Typography color="text.secondary">Trends</Typography>
        <Grid
          sx={{
            display: { md: "flex", lg: "grid" },
            "> *": { m: 1 },
            gridTemplateColumns: `1fr 1fr 1fr`,
            m: -1,
          }}
        >
          <RecentActivityChart columns={2} height={170} />
          <TotalSolvedClosedChart columns={1} height={170} />
        </Grid>
        <Grid
          width={420}
          sx={{
            "> *": { m: 1 },
            m: -1,
          }}
        >
          <CompletionByAgentCountChartCard
            columns={1}
            height={540}
            primaryLabel="Completion by agent count"
            secondaryLabel="Instances solved and closed across agent count"
          />
          <CompletionByAlgorithmChartCard
            primaryLabel="Completion by algorithm"
            columns={1}
            height={540}
            secondaryLabel="Compare instances closed and solved across algorithms"
          />
          <GridChartCard
            columns={1}
            height={540}
            primaryLabel="Completion by map type"
            content={<MapProportionChart />}
            secondaryLabel="Instances closed and solved across map types"
          />
        </Grid>
      </Stack>
      <Stack sx={{ gap: 2, my: 1 }}>
        <Typography color="text.secondary">Browse maps</Typography>
        <Table />
      </Stack>
    </Stack>
  );
}
