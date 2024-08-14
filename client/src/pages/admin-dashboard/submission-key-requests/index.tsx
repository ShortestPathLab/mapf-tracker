import {
  CallReceivedOutlined,
  EditOutlined,
  SendOutlined,
} from "@mui/icons-material";
import { Box, Button, Card, Divider, Stack } from "@mui/material";
import { IconCard } from "components/IconCard";
import { makeDataGridActions } from "components/data-grid";
import DataGrid, { GridColDef } from "components/data-grid/DataGrid";
import { useDialog } from "hooks/useDialog";
import { Layout } from "layout";
import {
  RequestWithReviewOutcome,
  useRequestsQuery,
} from "queries/useRequestsQuery";
import { ConfirmNotifyDialog } from "./ConfirmNotifyDialog";
import { ReviewRequestDialog } from "./ReviewRequestDialog";
import { StatusChip } from "./StatusChip";

export default function index() {
  const { data: requests } = useRequestsQuery();
  const { open: showDetails, dialog: detailsDialog } = useDialog(
    ReviewRequestDialog,
    {
      title: "Review submission key request",
      slotProps: { modal: { width: 1200 } },
      padded: true,
    }
  );
  const { open: showConfirmation, dialog: confirmationDialog } = useDialog(
    ConfirmNotifyDialog,
    { padded: true, title: "Generate and send API key" }
  );

  const columns: GridColDef<RequestWithReviewOutcome>[] = [
    {
      field: "Icon",
      renderCell: () => <IconCard icon={<CallReceivedOutlined />} />,
      flex: 0,
      fold: true,
    },
    {
      field: "algorithmName",
      headerName: "Algorithm",
      sortable: false,
      width: 280,
    },
    {
      field: "requesterName",
      headerName: "Requester",
      sortable: false,
      width: 140,
    },
    {
      field: "requesterEmail",
      headerName: "Email",
      sortable: false,
      width: 220,
    },

    {
      field: "reviewStatus.status",
      headerName: "Outcome",
      sortable: true,
      width: 180,
      renderCell: ({ row }) => <StatusChip status={row.reviewStatus.status} />,
    },
    {
      field: "reviewStatus.comments",
      headerName: "Comments",
      sortable: true,
      width: 180,
      renderCell: ({ row }) =>
        row.reviewStatus.comments || (
          <Box color="text.secondary">No comments</Box>
        ),
    },
    makeDataGridActions({
      items: [
        {
          name: "Review request",
          icon: <EditOutlined />,
          action: (row) => showDetails({ data: row }),
        },
        {
          name: "Send outcome",
          icon: <SendOutlined />,
          action: (row) => showConfirmation({ data: row }),
        },
      ],
    }),
  ];

  return (
    <Layout
      title="Submission key requests"
      path={[
        { name: "Home", url: "/" },
        { name: "Dashboard", url: "/dashboard" },
      ]}
    >
      <Card>
        <DataGrid
          clickable
          onRowClick={({ row }) => showDetails({ data: row })}
          columns={columns}
          rows={requests}
          extras={
            <Stack direction="row" sx={{ gap: 2 }}>
              <Divider orientation="vertical" flexItem />
              <Button sx={{ minWidth: "max-content" }} variant="contained">
                Create request
              </Button>
            </Stack>
          }
        />
      </Card>
      {detailsDialog}
      {confirmationDialog}
    </Layout>
  );
}
