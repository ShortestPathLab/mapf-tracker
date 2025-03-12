import { TextField, TextFieldProps } from "@mui/material";
import { CheckboxItem } from "components/analysis/ChartOptions";
import { renderSelectChip } from "components/analysis/renderSelectChip";
import { chain, startCase } from "lodash";
import { useBenchmarksData } from "queries/useBenchmarksQuery";

// TODO: Current picker uses name as ID, should use ID

export function MapPicker({ ...props }: TextFieldProps) {
  const { data } = useBenchmarksData();
  return (
    <TextField
      label="Map"
      sx={{ minWidth: 80, ...props.sx }}
      variant="filled"
      SelectProps={{
        ...props.SelectProps,
        multiple: true,
        MenuProps: { slotProps: { paper: { sx: { maxHeight: 480 } } } },
        renderValue: renderSelectChip(startCase),
      }}
      {...props}
      select
    >
      {chain(data)
        .map((c) => c.map_name)
        .uniq()
        .map((name) => (
          <CheckboxItem value={name} key={name}>
            {startCase(name)}
          </CheckboxItem>
        ))
        .value()}
    </TextField>
  );
}
