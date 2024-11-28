import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { ConfirmDialog } from "components/dialog/Modal";
import { FlatCard } from "components/FlatCard";
import { format, isBefore, parseISO } from "date-fns";
import { useDialog } from "hooks/useDialog";
import { useLocationState } from "hooks/useNavigation";
import { Layout } from "layout";
import { filter, minBy, now, some, startCase, sumBy } from "lodash";
import { SubmissionLocationState } from "pages/submissions/SubmissionLocationState";
import {
  deleteAll,
  useDeleteOngoingSubmissionMutation,
  useFinaliseOngoingSubmissionMutation,
  useOngoingSubmissionSummaryQuery,
  useOngoingSubmissionTicketQuery,
} from "queries/useOngoingSubmissionQuery";
import { useSubmissionKeyQuery } from "queries/useSubmissionKeyQuery";
import { Actions } from "./Actions";
import { SubmissionRequestGlance } from "./SubmissionRequestGlance";
import SubmissionSummary from "./SubmissionSummary";
import SummaryTable from "./table/SummaryTable";
import { DeleteOutlined } from "@mui/icons-material";
import { SubmissionKeyRequestFormDialog } from "pages/submissions/SubmissionKeyRequestFormDialog";
import { Counter } from "components/Counter";

const hintText =
  "You will not be able to edit this submission after it has been submitted. To make a new submission, you must request a new submission key.";

export default function SubmissionSummaryPage() {
  const { apiKey } = useLocationState<SubmissionLocationState>();
  const { data } = useOngoingSubmissionSummaryQuery(apiKey);
  const { data: apiKeyData } = useSubmissionKeyQuery(apiKey);
  const { mutate: finalise } = useFinaliseOngoingSubmissionMutation(apiKey);
  const { data: isPending } = useOngoingSubmissionTicketQuery(apiKey);
  const { mutate: deleteSubmissions } =
    useDeleteOngoingSubmissionMutation(apiKey);
  const { open, close, dialog } = useDialog(ConfirmDialog, {
    title: "Finalise submission",
    padded: true,
  });

  const keyStatus = apiKeyData
    ? apiKeyData?.status?.type === "submitted"
      ? "submitted"
      : apiKeyData?.expirationDate &&
        isBefore(now(), parseISO(apiKeyData.expirationDate))
      ? "in-progress"
      : "expired"
    : "unknown";

  return (
    <Layout
      flat
      title="Submit data"
      path={[
        { name: "Submit", url: "/submit" },
        { name: "Submit an algorithm", url: "/contributes" },
        { name: "Manage submissions", url: "/trackSubmission" },
      ]}
    >
      <SubmissionRequestGlance apiKey={apiKey} />
      <Actions apiKey={apiKey} />
      <Divider />
      <Typography variant="h2">Submission Progress</Typography>
      <SubmissionSummary
        status={
          <>
            {some(isPending, (p) => p.status === "pending") ? (
              <Chip
                color="warning"
                icon={
                  <Stack sx={{ pl: 0.5 }}>
                    <CircularProgress size="1rem" color="inherit" />
                  </Stack>
                }
                label={
                  <>
                    {"Receiving and preprocessing data: "}
                    <Counter
                      start={
                        minBy(
                          filter(isPending, (p) => p.status === "pending"),
                          "dateReceived"
                        )?.dateReceived ?? now()
                      }
                    />
                  </>
                }
              />
            ) : (
              <Chip
                color={
                  {
                    submitted: "success",
                    "in-progress": "warning",
                    expired: "error",
                  }[keyStatus] ?? "default"
                }
                label={startCase(keyStatus)}
              />
            )}
            <Typography variant="body2" color="text.secondary">
              Expiry:{" "}
              {apiKeyData?.expirationDate &&
                format(
                  parseISO(apiKeyData?.expirationDate),
                  "hh:mm aaa, dd MMM yyyy"
                )}
            </Typography>
          </>
        }
        summaryStats={[
          { name: "Received", count: sumBy(data?.maps, "count.total") },
          {
            name: "Running",
            count: sumBy(data?.maps, "count.queued"),
          },
          {
            name: "Run",
            count:
              sumBy(data?.maps, "count.valid") +
              sumBy(data?.maps, "count.invalid"),
          },
          {
            name: "Valid",
            count: sumBy(data?.maps, "count.valid"),
          },
          {
            name: "Invalid",
            count: sumBy(data?.maps, "count.invalid"),
          },
          {
            name: "Duplicate",
            count: sumBy(data?.maps, "count.outdated"),
          },
          {
            name: "Best",
            count: sumBy(data?.maps, "count.best"),
          },
          {
            name: "Dominated",
            count:
              sumBy(data?.maps, "count.valid") -
              sumBy(data?.maps, "count.best"),
          },
        ]}
        detailStats={[]}
        extras={[
          <Button
            startIcon={<DeleteOutlined />}
            onClick={() => deleteSubmissions(deleteAll)}
          >
            Delete all
          </Button>,
        ]}
      >
        {/* <DataGrid clickable columns={columns} rows={data} /> */}
        <FlatCard>
          <SummaryTable apiKey={apiKey} />
        </FlatCard>
      </SubmissionSummary>
      <Button
        disabled={keyStatus === "submitted" || keyStatus === "expired"}
        variant="contained"
        disableElevation
        size="large"
        sx={{ alignSelf: "flex-end", bgcolor: "text.primary" }}
        onClick={() =>
          open({
            hintText,
            acceptLabel: "Submit now",
            acceptProps: { color: "primary" },
            closeLabel: "Cancel",
            onAccept: () => {
              finalise();
              close();
            },
            onClose: close,
          })
        }
      >
        Finish Submission
      </Button>
      {dialog}
    </Layout>
  );
}
