import {
  Autocomplete as MuiAutocomplete,
  AutocompleteProps,
  SxProps,
} from "@mui/material";
import Box, { BoxProps } from "@mui/material/Box";
import FormHelperText, {
  FormHelperTextProps,
} from "@mui/material/FormHelperText";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import {
  ErrorMessage,
  ErrorMessageProps,
  Field as FormikField,
  useFormik,
  useFormikContext,
} from "formik";
import { ComponentProps, ComponentType, forwardRef, Ref } from "react";
import { paper } from "theme";

export function Field<
  Schema extends {} = any,
  T extends ComponentType<{}> = typeof TextField
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
        color={errors[name] && touched[name] ? "error" : undefined}
        {...fieldProps}
      />
      <ErrorMessage
        name={name}
        component={FormHelperText}
        {...slotProps.error}
        {...({
          sx: {
            color: "error.main",
            fontSize: "0.8rem",
            mt: 1,
            ...slotProps.error?.sx,
          } as SxProps,
        } as any)}
      />
    </Box>
  );
}

export const Select = forwardRef(
  (props: TextFieldProps, ref: Ref<HTMLDivElement>) => (
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
  )
);

export const Autocomplete = forwardRef(function <
  Value,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
  ChipComponent extends React.ElementType = "div"
>(
  {
    autoCompleteProps,
    disabled,
    ...props
  }: {
    autoCompleteProps?: Omit<
      AutocompleteProps<
        Value,
        Multiple,
        DisableClearable,
        FreeSolo,
        ChipComponent
      >,
      "renderInput"
    >;
  } & TextFieldProps,
  ref: Ref<HTMLDivElement>
) {
  const form = useFormikContext();
  return (
    <MuiAutocomplete
      disabled={disabled}
      {...autoCompleteProps}
      onBlur={(e) => form.setFieldValue(props.name, e.target["value" as any])}
      renderInput={(props1) => <TextField ref={ref} {...props} {...props1} />}
    />
  );
});
