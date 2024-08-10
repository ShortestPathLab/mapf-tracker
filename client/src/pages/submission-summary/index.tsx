import { InfoOutlined, RouteOutlined } from "@mui/icons-material";
import { Box, Card, Chip, List, ListItem, ListItemText } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { DataGrid, makeDataGridActions } from "components/data-grid";
import { GridColDef } from "components/data-grid/DataGrid";
import { Dialog } from "components/dialog";
import { IconCard } from "components/IconCard";
import { APIConfig } from "core/config";
import { format, parseISO } from "date-fns";
import { useLocationState } from "hooks/useNavigation";
import { capitalize, entries, filter, startCase } from "lodash";
import { SubmissionLocationState } from "pages/submissions/SubmissionLocationState";
import { json } from "queries/query";
import { cloneElement } from "react";
import SubmissionSummary from "./SubmissionSummary";
import GenericDetailsList from "./GenericDetailsList";

const REFETCH_MS = 2000;

type V = {
  isValidationRun: boolean;
  outcome: string;
  errors: string[];
};

type R = {
  index: number;
  createdAt: string;
  validation: V;
};
function useOngoingSubmission(key?: string | number) {
  return useQuery({
    queryKey: ["ongoingSubmissions", key],
    queryFn: () => json<R[]>(`${APIConfig.apiUrl}/ongoing_submission/${key}`),
    enabled: !!key,
    refetchInterval: REFETCH_MS,
  });
}

const columns: GridColDef<R>[] = [
  {
    field: "Icon",
    renderCell: () => <IconCard icon={<RouteOutlined />} />,
    flex: 0,
  },
  {
    field: "agentCountIntent",
    headerName: "Agent count intent",
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
    valueGetter: (c: V) => c.outcome ?? "pending",
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
  }),
];
export default function SubmissionSummaryPage() {
  const { apiKey } = useLocationState<SubmissionLocationState>();
  const { data } = useOngoingSubmission(apiKey);
  return (
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
      <Card>
        <DataGrid columns={columns} rows={data} />
      </Card>
    </SubmissionSummary>
  );
}
