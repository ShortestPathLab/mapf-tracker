import {
  Checkbox,
  MenuItem,
  MenuItemProps,
  Stack,
  TextField,
} from "@mui/material";
import { useXs } from "components/dialog/useSmallDisplay";
import { BaseMetric, metrics as defaultMetrics } from "core/metrics";
import { find } from "lodash";
import { renderSelectChip } from "components/analysis/renderSelectChip";
import { useAlgorithmsData } from "queries/useAlgorithmQuery";
import { setFromEvent } from "utils/set";
import { Slice, useAlgorithmSelector } from "./useAlgorithmSelector";
import { ReactNode } from "react";

export function CheckboxItem({ selected, children, ...props }: MenuItemProps) {
  return (
    <MenuItem {...props}>
      <Checkbox
        checked={selected}
        sx={{
          pointerEvents: "none",
          p: 0,
          py: 0.5,
          pr: 2,
        }}
      />
      {children}
    </MenuItem>
  );
}

export const stateOfTheArt = {
  algo_name: "(State of the art)",
  _id: "state-of-the-art",
};

export default function ChartOptions({
  slices,
  setSlice,
  slice,
  setMetric,
  metric,
  setSelected,
  selected,
  metrics = defaultMetrics,
  stateOfTheArt: stateOfTheArtEnabled,
  extras,
}: {
  stateOfTheArt?: boolean;
  slices?: Slice[];
  metrics?: BaseMetric[];
  extras?: ReactNode;
} & Partial<ReturnType<typeof useAlgorithmSelector>>) {
  const xs = useXs();
  const { data: algorithms = [] } = useAlgorithmsData();
  const algorithms1 = stateOfTheArtEnabled
    ? [stateOfTheArt, ...algorithms]
    : algorithms;
  return (
    <Stack direction={xs ? "column" : "row"} sx={{ gap: 1, mb: 2 }}>
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
          renderValue: renderSelectChip(
            (id) => find(algorithms1, { _id: id })?.algo_name
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
        {algorithms1.map((a) => (
          <CheckboxItem key={a._id} value={a._id}>
            {a.algo_name}
          </CheckboxItem>
        ))}
      </TextField>
      {extras}
    </Stack>
  );
}
