import {
  CallReceivedRounded,
  DeleteRounded,
  EditRounded,
  KeyRounded,
  SendRounded,
} from "@mui-symbols-material/w400";
import { Box } from "@mui/material";
import { FlatCard } from "components/FlatCard";
import { IconCard } from "components/IconCard";
import { Item } from "components/Item";
import { useSnackbarAction } from "components/Snackbar";
import { cellRendererText, useDataGridActions } from "components/data-grid";
import DataGrid, { GridColDef } from "components/data-grid/DataGrid";
import { ConfirmDialog } from "components/dialog/Modal";
import { Surface } from "components/surface";
import { useSurface } from "components/surface/useSurface";
import { useNavigate } from "hooks/useNavigation";
import { Layout } from "layout";
import { bindTrigger } from "material-ui-popup-state";
import {
  requestBasic,
  RequestWithReviewOutcome,
} from "queries/useRequestsQuery";
import { useCreateSubmissionKey } from "queries/useSubmissionKeyQuery";
import { ConfirmNotifyDialog } from "./ConfirmNotifyDialog";
import { ReviewRequestDialog } from "./ReviewRequestDialog";
import { StatusChip } from "./StatusChip";

export default function index() {
  const navigate = useNavigate();
  const notify = useSnackbarAction();
  const { data: requests, isLoading } = requestBasic.useAll();
  const { mutateAsync: deleteOne } = requestBasic.useDelete();
  const { mutateAsync: createKey } = useCreateSubmissionKey();
  const { open: showDetails, dialog: detailsDialog } = useSurface(
    ReviewRequestDialog,
    {
      title: "Review submission key request",
      slotProps: { paper: { sx: { maxWidth: "min(max(70vw, 640px), 100%)" } } },
    }
  );
  const { open: showConfirmation, dialog: confirmationDialog } = useSurface(
    ConfirmNotifyDialog,
    {
      title: "Respond to request",
    }
  );

  const actions = useDataGridActions<RequestWithReviewOutcome>({
    menuItems: [
      {
        name: "Generate API key",

        render: (row, trigger) => (
          <Surface
            title="Create API key"
            variant="modal"
            trigger={(state) => <Box {...bindTrigger(state)}>{trigger}</Box>}
          >
            {(state) => (
              <ConfirmDialog
                acceptLabel="Create key"
                closeLabel="Cancel"
                acceptColor="primary"
                hintText="Generate an API key for this request. Use this option if you want to manually share an API key with a user. Otherwise, please use the 'Respond to request' option."
                onClose={state.close}
                onAccept={notify(
                  async () => {
                    const result = await createKey(row.id);
                    navigate(`/sudo/api-keys`, { q: result.key });
                  },
                  {
                    start: "Creating key",
                    end: "Key created, check Manage -> API keys",
                  }
                )}
              />
            )}
          </Surface>
        ),
        icon: <KeyRounded />,
      },
      {
        name: "Delete",
        render: (row, trigger) => (
          <Surface
            title="Delete request"
            variant="modal"
            trigger={(state) => <Box {...bindTrigger(state)}>{trigger}</Box>}
          >
            {(state) => (
              <ConfirmDialog
                acceptLabel="Delete request"
                closeLabel="Cancel"
                hintText="Are you sure you want to delete this request?"
                onClose={state.close}
                onAccept={notify(() => deleteOne(row.id), {
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
    items: [
      {
        name: "Review request",
        icon: <EditRounded />,
        action: (row) => showDetails({ data: row }),
      },
      {
        name: "Respond to request",
        icon: <SendRounded />,
        action: (row) => showConfirmation({ data: row }),
      },
    ],
  });

  const columns: GridColDef<RequestWithReviewOutcome>[] = [
    {
      field: "Icon",
      width: 48,
      renderCell: () => <IconCard icon={<CallReceivedRounded />} />,
      flex: 0,
      fold: true,
    },
    {
      field: "algorithmName",
      headerName: "Algorithm",
      sortable: false,
      width: 220,
      renderCell: ({ row }) => (
        <Item secondary={row.id?.slice?.(-8)} primary={row.algorithmName} />
      ),
    },
    {
      fold: true,
      field: "requesterName",
      headerName: "Requester",
      sortable: false,
      width: 140,
      renderCell: cellRendererText,
    },
    {
      fold: true,
      field: "requesterEmail",
      headerName: "Email",
      sortable: false,
      width: 220,
      renderCell: cellRendererText,
    },

    {
      fold: true,
      field: "reviewStatus.status",
      headerName: "Outcome",
      sortable: true,
      width: 180,
      renderCell: ({ row }) => <StatusChip status={row.reviewStatus.status} />,
    },
    {
      fold: true,
      field: "reviewStatus.comments",
      headerName: "Comments",
      sortable: true,
      width: 180,
      renderCell: ({ row }) =>
        cellRendererText({
          formattedValue: row.reviewStatus.comments || (
            <Box component="span" color="text.secondary">
              No comments
            </Box>
          ),
        }),
    },
    actions,
  ];

  return (
    <Layout
      flat
      title="Submission key requests"
      path={[
        { name: "More", url: "/more" },
        { name: "Sudo", url: "/sudo" },
      ]}
    >
      <FlatCard>
        <DataGrid
          loading={isLoading}
          search
          clickable
          onRowClick={({ row }) => showDetails({ data: row })}
          columns={columns}
          rows={requests}
        />
      </FlatCard>
      {detailsDialog}
      {confirmationDialog}
    </Layout>
  );
}
