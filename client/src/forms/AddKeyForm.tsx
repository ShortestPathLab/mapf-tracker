import { Box } from "@mui/material";
import { Field } from "components/Field";
import { FormikProps, FormikConfig, Formik, Form } from "formik";
import { noop } from "lodash";
import { ReactNode } from "react";
import { object, string } from "yup";

export type Key = {
  key: string;
};

export type AddKeyFormProps = {
  keys: string[];
  submit: (state: FormikProps<Key>) => ReactNode;
} & Partial<FormikConfig<Key>>;

export function AddKeyForm({
  keys,
  submit = () => <></>,
  ...props
}: AddKeyFormProps) {
  return (
    <Formik<Key>
      validationSchema={object({
        key: string().notOneOf(keys, "Key already added."),
      })}
      initialValues={{ key: "" }}
      onSubmit={noop}
      {...props}
    >
      {(state) => (
        <Form>
          <Box
            sx={{
              display: "flex",
              alignItems: "start",
              gap: 2,
              "> *:first-child": { flex: 1 },
            }}
          >
            <Field
              fullWidth
              name="key"
              label="Submission (API) key"
              variant="filled"
              required
            />
            {submit(state)}
          </Box>
        </Form>
      )}
    </Formik>
  );
}
