import { Button, Stack, Typography } from "@mui/material";
import { Form, Formik, FormikConfig, FormikProps } from "formik";
import { DialogContentProps } from "hooks/useDialog";
import { noop } from "lodash";
import { ReactNode } from "react";
import { Field } from "../Field";
import { useSnackbar } from "../Snackbar";
import { useLogInMutation } from "../../queries/useLogInQuery";

export type LogInFormData = { username: string; password: string };
function LogInForm({
  submit = () => <></>,
  ...props
}: Partial<FormikConfig<LogInFormData>> & {
  submit: (s: FormikProps<LogInFormData>) => ReactNode;
}) {
  return (
    <Formik<LogInFormData>
      onSubmit={noop}
      initialValues={{ username: "", password: "" }}
      {...props}
    >
      {(s) => (
        <Form>
          <Stack sx={{ gap: 2 }}>
            <Field name="username" label="Username" variant="filled" required />
            <Field
              name="password"
              label="Password"
              type="password"
              variant="filled"
            />
            {submit(s)}
          </Stack>
        </Form>
      )}
    </Formik>
  );
}
export function LogInDialog({ onClose }: DialogContentProps) {
  const notify = useSnackbar();
  const {
    logIn: { mutateAsync: logIn },
  } = useLogInMutation();
  return (
    <Stack sx={{ gap: 2 }}>
      <Typography color="text.secondary">
        Log in with your administrator account to access management options.
      </Typography>
      <LogInForm
        onSubmit={async (values, { setFieldError }) => {
          notify("Logging in");
          const result = await logIn(values);
          if (result) {
            notify("Logged in");
            onClose?.();
          } else {
            setFieldError("password", "Invalid username or password");
            notify("Couldn't log in");
          }
        }}
        submit={(s) => (
          <Button variant="contained" type="submit">
            Log in
          </Button>
        )}
      />
    </Stack>
  );
}
