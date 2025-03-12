import {
  CallReceivedRounded,
  EditRounded,
  SendRounded,
} from "@mui-symbols-material/w400";
import { Box } from "@mui/material";
import { IconCard } from "components/IconCard";
import { Item } from "components/Item";
import { cellRendererText, useDataGridActions } from "components/data-grid";
import DataGrid, { GridColDef } from "components/data-grid/DataGrid";
import { useSurface } from "components/surface/useSurface";
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
        { name: "Dashboard", url: "/dashboard" },
      ]}
    >
      <DataGrid
        search
        clickable
        onRowClick={({ row }) => showDetails({ data: row })}
        columns={columns}
        rows={requests}
      />
      {detailsDialog}
      {confirmationDialog}
    </Layout>
  );
}
