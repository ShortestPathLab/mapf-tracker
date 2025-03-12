import { Box, Stack } from "@mui/material";
import { Field } from "components/Field";
import { useXs } from "components/dialog/useSmallDisplay";
import { FormikProps, FormikConfig, Formik, Form } from "formik";
import { noop } from "lodash";
import { ReactNode } from "react";
import { object, string } from "yup";

export type Key = {
  key: string;
};

export type AddKeyFormProps = {
  submit: (state: FormikProps<Key>) => ReactNode;
} & Partial<FormikConfig<Key>>;

export function AddKeyForm({
  submit = () => <></>,
  ...props
}: AddKeyFormProps) {
  const xs = useXs();
  return (
    <Formik<Key>
      validationSchema={object({
        key: string(),
      })}
      initialValues={{ key: "" }}
      onSubmit={noop}
      {...props}
    >
      {(state) => (
        <Form>
          <Stack
            direction={xs ? "column" : "row"}
            sx={{
              alignItems: xs ? "stretch" : "start",
              gap: 2,
              "> *:first-child": { flex: 1 },
            }}
          >
            <Field
              fullWidth
              name="key"
              label="Your submission (API) key"
              variant="filled"
              required
            />
            {submit(state)}
          </Stack>
        </Form>
      )}
    </Formik>
  );
}
