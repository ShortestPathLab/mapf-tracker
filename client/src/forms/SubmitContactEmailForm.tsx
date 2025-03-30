import { Field } from "components/Field";
import { Form, Formik, FormikConfig, FormikProps } from "formik";
import { noop } from "lodash";
import { ReactNode } from "react";
import { object, string } from "yup";

export type Email = {
  email: string;
};

export type SubmitContactEmailFormProps = {
  submit: (state: FormikProps<Email>) => ReactNode;
} & Partial<FormikConfig<Email>>;

export function SubmitContactEmailForm({
  submit = () => <></>,
  ...props
}: SubmitContactEmailFormProps) {
  return (
    <Formik<Email>
      validationSchema={object({
        email: string()
          .email("Must be an email.")
          .required("Email is required."),
      })}
      initialValues={{ email: "" }}
      onSubmit={noop}
      {...props}
    >
      {(state) => (
        <Form>
          <Field
            fullWidth
            name="email"
            label="Your contact email"
            variant="filled"
            required
          />
          {submit(state)}
        </Form>
      )}
    </Formik>
  );
}
