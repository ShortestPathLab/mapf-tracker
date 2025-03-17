import {
  AddRounded,
  DeleteRounded,
  KeyRounded,
} from "@mui-symbols-material/w400";
import { Box } from "@mui/material";
import { ActionBar } from "components/ActionBar";
import {
  cellRendererChip,
  DataGrid,
  useDataGridActions,
} from "components/data-grid";
import { GridColDef } from "components/data-grid/DataGrid";
import { ConfirmDialog } from "components/dialog/Modal";
import { FlatCard } from "components/FlatCard";
import { IconCard } from "components/IconCard";
import { Item } from "components/Item";
import { useSnackbar, useSnackbarAction } from "components/Snackbar";
import { Surface } from "components/surface";
import { Tip } from "components/Tip";
import { Layout } from "layout";
import { startCase } from "lodash";
import { bindTrigger } from "material-ui-popup-state";
import { parseApiKeyStatus } from "pages/submission-summary/parseApiKeyStatus";
import { requestBasic } from "queries/useRequestsQuery";
import { ApiKey, submissionKeyBasic } from "queries/useSubmissionKeyQuery";
import { DATE_TIME_FORMAT, formatDate } from "utils/format";

function RequestInfo({ id }: { id?: string }) {
  const { data } = requestBasic.useOne(id);
  return data ? `${data?.algorithmName}, ${data?.authorName}` : "--";
}

export default function index() {
  const { data } = submissionKeyBasic.useAll();
  const { mutateAsync: deleteOne } = submissionKeyBasic.useDelete();
  const notify = useSnackbar();
  const notifyAction = useSnackbarAction();
  const actions = useDataGridActions<ApiKey>({
    menuItems: [
      {
        name: "Delete",
        render: (row, trigger) => (
          <Surface
            title="Delete key"
            variant="modal"
            trigger={(state) => <Box {...bindTrigger(state)}>{trigger}</Box>}
          >
            {(state) => (
              <ConfirmDialog
                acceptLabel="Delete key"
                onClose={state.close}
                closeLabel="Cancel"
                hintText="Are you sure you want to delete this key?"
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
  const columns: GridColDef<ApiKey>[] = [
    {
      field: "Icon",
      width: 48,
      renderCell: () => <IconCard icon={<KeyRounded />} />,
      flex: 0,
      fold: true,
    },
    {
      field: "api_key",
      headerName: "Key",
      maxWidth: 360,
      flex: 3,
      renderCell: ({ formattedValue, row }) => (
        <Item
          primary={formattedValue}
          secondary={<RequestInfo id={row.request_id} />}
        />
      ),
    },
    {
      fold: true,
      field: "status.type",
      headerName: "Status",
      maxWidth: 120,
      sortable: true,
      flex: 1,
      renderCell: ({ row }) =>
        cellRendererChip({ formattedValue: startCase(parseApiKeyStatus(row)) }),
    },
    {
      fold: true,
      field: "creationDate",
      headerName: "Creation Date",
      maxWidth: 180,
      type: "date",
      sortable: true,
      flex: 2,
      valueFormatter: (v) => formatDate(v, DATE_TIME_FORMAT),
    },
    {
      fold: true,
      field: "expirationDate",
      headerName: "Expiration Date",
      maxWidth: 180,
      type: "date",
      sortable: true,
      flex: 2,
      valueFormatter: (v) => formatDate(v, DATE_TIME_FORMAT),
    },
    actions,
  ];
  return (
    <Layout
      flat
      title="API keys"
      path={[
        { name: "More", url: "/more" },
        { name: "Manage", url: "/dashboard" },
      ]}
    >
      <Tip
        title="API keys (coming soon)"
        description="Create, revoke and manage API keys."
      />
      <ActionBar
        title="Actions"
        options={[
          {
            label: "New API key",
            primary: true,
            icon: <AddRounded />,
            action: () =>
              notify(
                "Generate an API key in Manage -> Submission key requests -> Choose a request -> More options -> Generate API key"
              ),
          },
        ]}
      />
      <FlatCard>
        <DataGrid search rows={data} columns={columns} />
      </FlatCard>
    </Layout>
  );
}
