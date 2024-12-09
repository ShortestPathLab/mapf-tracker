import {
  CallReceivedOutlined,
  EditOutlined,
  SendOutlined,
} from "@mui/icons-material";
import { Box } from "@mui/material";
import { FlatCard } from "components/FlatCard";
import { IconCard } from "components/IconCard";
import { cellRendererText, useDataGridActions } from "components/data-grid";
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
import { Item } from "components/Item";

export default function index() {
  const { data: requests } = useRequestsQuery();
  const { open: showDetails, dialog: detailsDialog } = useDialog(
    ReviewRequestDialog,
    {
      title: "Review submission key request",
      slotProps: { modal: { width: 1200, variant: "default" } },
      padded: true,
    }
  );
  const { open: showConfirmation, dialog: confirmationDialog } = useDialog(
    ConfirmNotifyDialog,
    {
      padded: true,
      slotProps: { modal: { variant: "default" } },
      title: "Respond to request",
    }
  );

  const actions = useDataGridActions<RequestWithReviewOutcome>({
    items: [
      {
        name: "Review request",
        icon: <EditOutlined />,
        action: (row) => showDetails({ data: row }),
      },
      {
        name: "Respond to request",
        icon: <SendOutlined />,
        action: (row) => showConfirmation({ data: row }),
      },
    ],
  });

  const columns: GridColDef<RequestWithReviewOutcome>[] = [
    {
      field: "Icon",
      width: 48,
      renderCell: () => <IconCard icon={<CallReceivedOutlined />} />,
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
      path={[{ name: "Manage", url: "/manage" }]}
    >
      <FlatCard>
        <DataGrid
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
