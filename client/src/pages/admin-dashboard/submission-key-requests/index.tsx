import {
  CallReceivedOutlined,
  EditOutlined,
  SendOutlined,
} from "@mui/icons-material";
import { Box } from "@mui/material";
import { FlatCard } from "components/FlatCard";
import { IconCard } from "components/IconCard";
import { makeDataGridActions } from "components/data-grid";
import DataGrid, { GridColDef } from "components/data-grid/DataGrid";
import { useSm } from "components/dialog/useSmallDisplay";
import { useDialog } from "hooks/useDialog";
import { Layout } from "layout";
import {
  RequestWithReviewOutcome,
  useRequestsQuery,
} from "queries/useRequestsQuery";
import { ConfirmNotifyDialog } from "./ConfirmNotifyDialog";
import { ReviewRequestDialog } from "./ReviewRequestDialog";
import { StatusChip } from "./StatusChip";
import { Sidebar } from "../Sidebar";

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
    { padded: true, title: "Respond to request" }
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
      width: 220,
    },
    {
      fold: true,
      field: "requesterName",
      headerName: "Requester",
      sortable: false,
      width: 140,
    },
    {
      fold: true,
      field: "requesterEmail",
      headerName: "Email",
      sortable: false,
      width: 220,
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
          name: "Respond to request",
          icon: <SendOutlined />,
          action: (row) => showConfirmation({ data: row }),
        },
      ],
    }),
  ];

  return (
    <Layout
      flat
      title="Submission key requests"
      path={[
        { name: "Home", url: "/" },
        { name: "Dashboard", url: "/dashboard" },
      ]}
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
