import {
  AddRounded,
  DeleteRounded,
  EditOutlined,
  PersonRounded,
} from "@mui-symbols-material/w400";
import { Box, Button, CircularProgress, Stack } from "@mui/material";
import { ActionBar } from "components/ActionBar";
import {
  cellRendererText,
  DataGrid,
  useDataGridActions,
} from "components/data-grid";
import { GridColDef } from "components/data-grid/DataGrid";
import { ConfirmDialog } from "components/dialog/Modal";
import { Field } from "components/Field";
import { FlatCard } from "components/FlatCard";
import { IconCard } from "components/IconCard";
import { useSnackbarAction } from "components/Snackbar";
import { Surface, useSurface } from "components/surface";
import { Form, Formik, FormikConfig, FormikProps } from "formik";
import { Layout } from "layout";
import { find, noop } from "lodash";
import { bindTrigger } from "material-ui-popup-state";
import { User, userBasic } from "queries/useSubmissionKeyQuery";
import { ReactNode } from "react";
import { DATE_TIME_FORMAT, formatDate } from "utils/format";
import { string, object } from "yup";

type UsernamePassword = {
  username: string;
  password: string;
};

function PasswordForm({
  submit,
  disabledValues,
  ...props
}: Partial<FormikConfig<UsernamePassword>> & {
  disabledValues?: { [K in keyof UsernamePassword]?: boolean };
  submit?: (state: FormikProps<UsernamePassword>) => ReactNode;
}) {
  const { data: users, isLoading } = userBasic.useAll();
  return isLoading ? (
    <CircularProgress />
  ) : (
    <Formik
      validateOnMount
      initialValues={{ username: "", password: "" }}
      validationSchema={object({
        username: string()
          .required("Username is required")
          .test({
            message: "Username already exists",
            test: (username) =>
              disabledValues?.username || !find(users, { username }),
          }),
        password: string().required("Password is required"),
      })}
      onSubmit={noop}
      {...props}
    >
      {(state) => (
        <Form>
          <Stack sx={{ gap: 2 }}>
            <Field
              name="username"
              disabled={disabledValues?.username}
              label="Username"
              variant="filled"
              required
            />
            <Field
              disabled={disabledValues?.password}
              name="password"
              label="Password"
              type="password"
              variant="filled"
              required
            />
            {submit?.(state)}
          </Stack>
        </Form>
      )}
    </Formik>
  );
}

export default function index() {
  const { data } = userBasic.useAll();
  const { mutateAsync: deleteOne } = userBasic.useDelete();
  const { mutateAsync: writeOne } = userBasic.useWrite();
  const changePassword = useSurface(PasswordForm, {
    title: "Admin user details",
  });
  const notifyAction = useSnackbarAction();
  const actions = useDataGridActions<User>({
    menuItems: [
      {
        name: "Change password",
        icon: <EditOutlined />,
        action: (row) =>
          changePassword.open({
            initialValues: { username: row.username, password: "" },
            disabledValues: { username: true },
            onSubmit: async (values) => {
              await notifyAction(() => writeOne({ id: row.id, ...values }), {
                start: "Updating",
                end: "Updated",
              })();
              changePassword.close();
            },
            submit: (state) => {
              return (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!state.isValid}
                  onClick={state.submitForm}
                >
                  Update password
                </Button>
              );
            },
          }),
      },
      {
        name: "Delete",
        hidden: () => data?.length <= 1,
        render: (row, trigger) => (
          <Surface
            title="Delete user"
            variant="modal"
            trigger={(state) => <Box {...bindTrigger(state)}>{trigger}</Box>}
          >
            {(state) => (
              <ConfirmDialog
                acceptLabel="Delete user"
                onClose={state.close}
                closeLabel="Cancel"
                hintText="Are you sure you want to delete this user?"
                onAccept={notifyAction(() => deleteOne(row.id), {
                  start: "Deleting",
                  end: "Deleted",
                })}
              />
            )}
          </Surface>
        ),
        icon: <DeleteRounded />,
      },
    ],
  });
  const columns: GridColDef<User>[] = [
    {
      field: "Icon",
      width: 48,
      renderCell: () => <IconCard icon={<PersonRounded />} />,
      flex: 0,
      fold: true,
    },
    {
      field: "username",
      headerName: "Username",
      maxWidth: 320,
      flex: 3,
      renderCell: cellRendererText,
    },
    {
      field: "createdAt",
      headerName: "Creation date",
      flex: 2,
      fold: true,
      renderCell: (params) => formatDate(params.value, DATE_TIME_FORMAT),
    },

    actions,
  ];
  return (
    <Layout
      flat
      title="Admin users"
      path={[
        { name: "More", url: "/more" },
        { name: "Manage", url: "/dashboard" },
      ]}
    >
      <ActionBar
        title="Actions"
        options={[
          {
            label: "New User",
            primary: true,
            icon: <AddRounded />,
            action: () =>
              changePassword.open({
                onSubmit: async (values) => {
                  await notifyAction(
                    () =>
                      writeOne({
                        id: undefined,
                        ...values,
                      }),
                    {
                      start: "Creating",
                      end: "Created",
                    }
                  )();
                  changePassword.close();
                },
                submit: (state) => {
                  return (
                    <Button
                      variant="contained"
                      disabled={!state.isValid}
                      onClick={state.submitForm}
                    >
                      Create user
                    </Button>
                  );
                },
              }),
          },
        ]}
      />
      <FlatCard>
        <DataGrid search rows={data} columns={columns} />
      </FlatCard>
      {changePassword.dialog}
    </Layout>
  );
}
