import {
  Checkbox,
  MenuItem,
  MenuItemProps,
  Stack,
  TextField,
} from "@mui/material";
import { renderSelectChip } from "components/analysis/renderSelectChip";
import { Scroll } from "components/dialog/Scrollbars";
import { BaseMetric, metrics as defaultMetrics } from "core/metrics";
import { find } from "lodash";
import { useAlgorithmsData } from "queries/useAlgorithmQuery";
import { ReactNode } from "react";
import { setFromEvent } from "utils/set";
import { Slice, useSliceSelector } from "./useAlgorithmSelector";

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
  setAlgorithms: setSelected,
  algorithms: selected,
  metrics = defaultMetrics,
  stateOfTheArt: stateOfTheArtEnabled,
  extras,
  disableAlgorithms,
  disableMetrics,
}: {
  stateOfTheArt?: boolean;
  slices?: Slice[];
  metrics?: BaseMetric[];
  extras?: ReactNode;
  disableAlgorithms?: boolean;
  disableMetrics?: boolean;
} & Partial<ReturnType<typeof useSliceSelector>>) {
  const { data: algorithms = [] } = useAlgorithmsData();
  const combinedAlgorithms = stateOfTheArtEnabled
    ? [stateOfTheArt, ...algorithms]
    : algorithms;
  return (
    <Stack sx={{ mb: 2 }}>
      <Scroll x fadeX>
        <Stack
          direction="row"
          sx={{
            gap: 1,
            "> *": {
              flexShrink: 0,
              minWidth: "140px !important",
              width: "max-content !important",
            },
          }}
        >
          {slices?.length > 1 && (
            <TextField
              select
              label="Display"
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
          {!disableMetrics && (
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
          )}
          {!disableAlgorithms && (
            <TextField
              select
              SelectProps={{
                multiple: true,
                renderValue: renderSelectChip(
                  (id) => find(combinedAlgorithms, { _id: id })?.algo_name
                ),
              }}
              label="Submission"
              variant="filled"
              value={selected}
              onChange={
                setFromEvent(setSelected) as (e: {
                  target: { value: unknown };
                }) => void
              }
            >
              {combinedAlgorithms.map((a) => (
                <CheckboxItem key={a._id} value={a._id}>
                  {a.algo_name}
                </CheckboxItem>
              ))}
            </TextField>
          )}

          {extras}
        </Stack>
      </Scroll>
    </Stack>
  );
}
