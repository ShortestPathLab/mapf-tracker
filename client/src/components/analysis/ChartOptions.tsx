import { Box, Chip, MenuItem, Stack, TextField } from "@mui/material";
import { map } from "lodash";
import { setFromEvent } from "utils/set";
import { Slice, useAlgorithmSelector } from "./useAlgorithmSelector";
import { BaseMetric, metrics as defaultMetrics } from "core/metrics";
import { useAlgorithmsData } from "queries/useAlgorithmQuery";

export default function ChartOptions({
  slices,
  setSlice,
  slice,
  setMetric,
  metric,
  setSelected,
  selected,
  metrics = defaultMetrics,
}: {
  slices?: Slice[];
  metrics?: BaseMetric[];
} & Partial<ReturnType<typeof useAlgorithmSelector>>) {
  const { data: algorithms = [] } = useAlgorithmsData();
  return (
    <Stack direction="row" sx={{ gap: 1, mb: 2 }}>
      {slices?.length > 1 && (
        <TextField
          select
          label="Slice"
          variant="filled"
          onChange={setFromEvent(setSlice)}
          value={slice.key}
        >
          {slices.map(({ key, name }) => (
            <MenuItem key={key} value={key}>
              {name}
            </MenuItem>
          ))}
        </TextField>
      )}
      <TextField
        select
        label="Metric"
        variant="filled"
        onChange={setFromEvent(setMetric)}
        value={metric}
      >
        {metrics.map(({ key, name }) => (
          <MenuItem key={key} value={key}>
            {name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        SelectProps={{
          multiple: true,
          renderValue: (selected: string[]) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {map(selected, (value, i) => (
                <Chip
                  sx={{ height: 22 }}
                  key={value}
                  label={algorithms[i].algo_name}
                  size="small"
                />
              ))}
            </Box>
          ),
        }}
        sx={{ minWidth: 180 }}
        label="Algorithm"
        variant="filled"
        value={selected}
        onChange={
          setFromEvent(setSelected) as (e: {
            target: { value: unknown };
          }) => void
        }
      >
        {algorithms.map((a) => (
          <MenuItem key={a._id} value={a._id}>
            {a.algo_name}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
}
