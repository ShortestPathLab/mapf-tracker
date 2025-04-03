import { TextField, TextFieldProps } from "@mui/material";
import { CheckboxItem } from "components/analysis/ChartOptions";
import { renderSelectChip } from "components/analysis/renderSelectChip";
import { chain, find, map, startCase } from "lodash";
import { useMapsData } from "queries/useMapQuery";

// TODO: Current picker uses name as ID, should use ID

export function MapPickerLegacy({ ...props }: TextFieldProps) {
  const { data } = useMapsData();
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

export function MapPicker({ ...props }: TextFieldProps) {
  const { data } = useMapsData();
  return (
    <TextField
      label="Map"
      sx={{ minWidth: 80, ...props.sx }}
      variant="filled"
      SelectProps={{
        ...props.SelectProps,
        multiple: true,
        MenuProps: { slotProps: { paper: { sx: { maxHeight: 480 } } } },
        renderValue: (xs: string[]) =>
          renderSelectChip(startCase)(
            map(xs, (id) => find(data, { id: id as string })?.map_name)
          ),
      }}
      {...props}
      select
    >
      {chain(data)
        .uniqBy((c) => c.map_name)
        .map(({ map_name, id }) => (
          <CheckboxItem value={id} key={id}>
            {startCase(map_name)}
          </CheckboxItem>
        ))
        .value()}
    </TextField>
  );
}
