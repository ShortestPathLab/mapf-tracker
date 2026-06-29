import {
  AutocompleteProps,
  Autocomplete as MuiAutocomplete,
  SxProps,
  Checkbox as MuiCheckbox,
  FormControlLabel,
  FormControlLabelProps,
} from "@mui/material";
import Box, { BoxProps } from "@mui/material/Box";
import FormHelperText, { FormHelperTextProps } from "@mui/material/FormHelperText";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { ErrorMessage, ErrorMessageProps, Field as FormikField, useFormikContext } from "formik";
import { ComponentProps, ComponentType, Ref, forwardRef } from "react";
import { paper } from "theme";

export function Field<
  Schema extends Record<string, string | number | object | boolean> = Record<
    string,
    string | number | object | boolean
  >,
  T extends ComponentType<object> = typeof TextField,
>({
  slotProps = {},
  as,
  name,
  ...fieldProps
}: ComponentProps<T> &
  Omit<ComponentProps<typeof FormikField>, "as" | "name"> & {
    name?: keyof Schema;
    as?: T;
    slotProps?: {
      root?: BoxProps;
      error?: ErrorMessageProps & FormHelperTextProps;
    };
  }) {
  const { errors, touched } = useFormikContext<Schema>();
  return (
    <Box {...slotProps.root}>
      <FormikField
        as={as || TextField}
        variant="outlined"
        label="Unlabelled"
        fullWidth
        name={name}
        color={name && errors[name] && touched[name] ? "error" : undefined}
        {...fieldProps}
      />
      <ErrorMessage
        component={FormHelperText}
        {...slotProps.error}
        {...({
          sx: {
            color: "error.main",
            fontSize: "0.8rem",
            mt: 1,
            ...slotProps.error?.sx,
          } as SxProps,
        } as unknown as ErrorMessageProps)}
        name={name ? String(name) : ""}
      />
    </Box>
  );
}

export const Select = forwardRef((props: TextFieldProps, ref: Ref<HTMLDivElement>) => (
  <TextField
    select
    {...props}
    SelectProps={{
      MenuProps: {
        slotProps: { paper: { sx: paper() } },
      },
      ...props.SelectProps,
    }}
    ref={ref}
  />
));

export const Checkbox = forwardRef(
  (props: Partial<FormControlLabelProps>, ref: Ref<HTMLButtonElement>) => {
    const form = useFormikContext();
    return (
      <FormControlLabel
        label="No label"
        {...props}
        ref={ref}
        control={
          <MuiCheckbox
            defaultChecked={!!props.value}
            onChange={(v) => {
              form.setFieldValue(props.name ?? "", v.target.checked);
            }}
          />
        }
      />
    );
  },
);

export const Autocomplete = forwardRef(function <
  Value,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
  ChipComponent extends React.ElementType = "div",
>(
  {
    autoCompleteProps,
    disabled,
    ...props
  }: {
    autoCompleteProps?: Omit<
      AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>,
      "renderInput"
    >;
  } & TextFieldProps,
  ref: Ref<HTMLDivElement>,
) {
  const form = useFormikContext();
  return (
    <MuiAutocomplete
      disabled={disabled}
      options={[]}
      {...autoCompleteProps}
      onBlur={(e) => {
        // The blur event target within the autocomplete is the text input
        form.setFieldValue(props.name ?? "", (e.target as HTMLInputElement).value);
      }}
      renderInput={(props1) => <TextField ref={ref} {...props} {...props1} />}
    />
  );
});
