import {
  DeleteOutlined,
  InfoOutlined,
  RouteOutlined,
} from "@mui/icons-material";
import { Chip } from "@mui/material";
import { DataGrid, makeDataGridActions } from "components/data-grid";
import { GridColDef } from "components/data-grid/DataGrid";
import { Dialog } from "components/dialog";
import { FlatCard } from "components/FlatCard";
import { IconCard } from "components/IconCard";
import { format, parseISO } from "date-fns";
import { useLocationState } from "hooks/useNavigation";
import { Layout } from "layout";
import { capitalize, filter } from "lodash";
import { SubmissionLocationState } from "pages/submissions/SubmissionLocationState";
import {
  OngoingSubmission,
  useDeleteOngoingSubmissionMutation,
  useOngoingSubmissionQuery,
  ValidationOutcome,
} from "queries/useOngoingSubmissionQuery";
import { cloneElement } from "react";
import GenericDetailsList from "./GenericDetailsList";
import SubmissionSummary from "./SubmissionSummary";

export default function SubmissionSummaryPage() {
  const { apiKey } = useLocationState<SubmissionLocationState>();
  const { data } = useOngoingSubmissionQuery(apiKey);
  const { mutate: deleteEntry } = useDeleteOngoingSubmissionMutation(apiKey);

  const columns: GridColDef<OngoingSubmission>[] = [
    {
      field: "Icon",
      renderCell: () => <IconCard icon={<RouteOutlined />} />,
      flex: 0,
      fold: true,
    },
    {
      field: "agentCountIntent",
      headerName: "Agent count",
      width: 140,
      sortable: true,
    },
    { field: "index", headerName: "Agent index", width: 140, sortable: true },
    {
      field: "createdAt",
      headerName: "Submitted",
      sortable: true,
      width: 220,
      valueFormatter: (c: string) =>
        format(parseISO(c), "hh:mm aaa, dd MMM yyyy"),
    },
    {
      field: "validation",
      sortable: true,
      headerName: "Status",
      valueGetter: (c: ValidationOutcome) => c.outcome ?? "pending",
      renderCell: ({ value }) => (
        <Chip
          label={capitalize(value)}
          color={
            {
              outdated: "default",
              valid: "success",
              invalid: "error",
            }[value] ?? "warning"
          }
        />
      ),
      width: 120,
    },
    makeDataGridActions({
      items: [
        {
          name: "Details",
          icon: <InfoOutlined />,
          render: (row, trigger) => (
            <Dialog
              slotProps={{ modal: { width: 720 } }}
              title="Submission details"
              padded
              trigger={(onClick) => cloneElement(trigger, { onClick })}
            >
              <GenericDetailsList data={row} sx={{ m: -2 }} />
            </Dialog>
          ),
        },
      ],
      menuItems: [
        {
          name: "Delete entry",
          icon: <DeleteOutlined />,
          action: (row) => deleteEntry(row.id),
        },
      ],
    }),
  ];

  return (
    <Layout
      title="Submission progress"
      width={960}
      path={[
        { name: "Home", url: "/" },
        { name: "Submit an algorithm", url: "/contributes" },
        { name: "Manage submissions", url: "/trackSubmission" },
      ]}
    >
      <SubmissionSummary
        apiKey={apiKey}
        summaryStats={[
          { name: "Submitted", count: data?.length },
          {
            name: "Validated",
            count: filter(data, (c) => c.validation?.isValidationRun)?.length,
          },
          {
            name: "Failed",
            count: filter(data, (c) => c.validation?.errors?.length)?.length,
          },
          {
            name: "Placeholder",
            count: -1,
          },
        ]}
        detailStats={[
          {
            name: "Placeholder",
            stats: [
              { name: "Placeholder", count: -1 },
              { name: "Placeholder", count: -1 },
              { name: "Placeholder", count: -1 },
            ],
          },
        ]}
      >
        <FlatCard>
          <DataGrid columns={columns} rows={data} />
        </FlatCard>
      </SubmissionSummary>
    </Layout>
  );
}
