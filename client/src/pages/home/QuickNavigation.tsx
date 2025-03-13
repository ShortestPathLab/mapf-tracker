import { Autocomplete, Avatar, Box, BoxProps, TextField } from "@mui/material";
import { Item } from "components/Item";
import { Benchmark } from "core/types";
import { useNavigate } from "hooks/useNavigation";
import { map } from "lodash";
import { MapLevelLocationState } from "pages/benchmarks-map-level/MapLevelLocationState";
import { MapLabel } from "pages/submission-summary/table/MapLabel";
import { useAlgorithmsData } from "queries/useAlgorithmQuery";
import { useBenchmarksData } from "queries/useBenchmarksQuery";

export function QuickNavigation() {
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
          label="Go to a map or submission"
          variant="filled"
          fullWidth
          {...props}
        />
      )}
    />
  );
}
