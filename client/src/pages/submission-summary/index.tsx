import { CheckOutlined } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { Counter } from "components/Counter";
import { FlatCard } from "components/FlatCard";
import { ConfirmDialog } from "components/dialog/Modal";
import { Scroll } from "components/dialog/Scrollbars";
import { useSm } from "components/dialog/useSmallDisplay";
import { isBefore, parseISO } from "date-fns";
import { useDialog } from "hooks/useDialog";
import { useLocationState } from "hooks/useNavigation";
import { Layout } from "layout";
import { topbarHeight } from "layout/topbarHeight";
import { filter, minBy, now, some, sumBy } from "lodash";
import { SubmissionLocationState } from "pages/submissions/SubmissionLocationState";
import {
  useFinaliseOngoingSubmissionMutation,
  useOngoingSubmissionSummaryQuery,
  useOngoingSubmissionTicketQuery,
} from "queries/useOngoingSubmissionQuery";
import { useSubmissionKeyQuery } from "queries/useSubmissionKeyQuery";
import { Actions } from "./Actions";
import { SubmissionRequestGlance } from "./SubmissionRequestGlance";
import SubmissionSummary from "./SubmissionSummary";
import { Tickets } from "./Tickets";
import SummaryTable from "./table/SummaryTable";

const hintText =
  "You will not be able to edit this submission after it has been submitted. To make a new submission, you must request a new submission key.";

export default function SubmissionSummaryPage() {
  const { apiKey } = useLocationState<SubmissionLocationState>();
  const { data } = useOngoingSubmissionSummaryQuery(apiKey);
  const { data: apiKeyData } = useSubmissionKeyQuery(apiKey);
  const { mutate: finalise } = useFinaliseOngoingSubmissionMutation(apiKey);
  const { data: isPending } = useOngoingSubmissionTicketQuery(apiKey);
  const { open, close, dialog } = useDialog(ConfirmDialog, {
    title: "Finalise submission",
    slotProps: { modal: { variant: "default" } },
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

  const sm = useSm();

  const contentLeft = [
    <SubmissionRequestGlance apiKey={apiKey} />,
    <Actions apiKey={apiKey} />,
    <Tickets apiKey={apiKey} />,
  ];

  const contentRight = [
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
                  {"Preprocessing data: "}
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
          ) : null}
        </>
      }
      summaryStats={[
        {
          label: "Progress",
          values: [
            { name: "Received", count: sumBy(data?.maps, "count.total") },
            {
              name: "Running",
              count: sumBy(data?.maps, "count.queued"),
            },
            {
              name: "Run",
              count:
                sumBy(data?.maps, "count.valid") +
                sumBy(data?.maps, "count.invalid") +
                sumBy(data?.maps, "count.outdated"),
            },
          ],
        },
        {
          label: "Outcome",
          values: [
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
          ],
        },
        {
          label: "Novelty",
          values: [
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
          ],
        },
      ]}
      detailStats={[]}
      extras={[]}
    >
      <Stack sx={{ gap: 2 }}>
        <Typography variant="h6">Details</Typography>
        {/* <DataGrid clickable columns={columns} rows={data} /> */}
        <FlatCard>
          <SummaryTable apiKey={apiKey} />
        </FlatCard>
      </Stack>
    </SubmissionSummary>,
  ];

  const contentBottom = [
    <Button
      startIcon={<CheckOutlined />}
      disabled={keyStatus === "submitted" || keyStatus === "expired"}
      variant="contained"
      disableElevation
      size="large"
      sx={{ alignSelf: sm ? "stretch" : "flex-end", bgcolor: "text.primary" }}
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
    </Button>,
  ];

  return (
    <>
      <Layout
        flat
        title="Submit data"
        path={[
          { name: "Submit", url: "/submit" },
          { name: "Submit an algorithm", url: "/contributes" },
          { name: "Manage submissions", url: "/trackSubmission" },
        ]}
      >
        {sm ? (
          <>
            {contentLeft}
            {contentRight}
            {/* Gap for sticky footer */}
            <Box sx={{ height: 72 }} />
          </>
        ) : (
          <Stack
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              height: `calc(100dvh - ${topbarHeight(sm)}px)`,
              right: 0,
            }}
          >
            <Stack
              direction="row"
              sx={{
                bgcolor: "background.default",
                height: "100%",
              }}
            >
              <Scroll y style={{ flex: 0.5, minWidth: 480 }}>
                <Stack sx={{ gap: 4, p: 3, flex: 1 }}>
                  <Typography variant="h2">Upload data</Typography>
                  {contentLeft}
                </Stack>
              </Scroll>
              <Divider flexItem orientation="vertical" />
              <Scroll y style={{ flex: 1 }}>
                <Stack sx={{ gap: 4, p: 3, flex: 1 }}>
                  <Typography variant="h2" sx={{ mb: -2 }}>
                    Validation
                  </Typography>
                  {contentRight}
                  {/* Gap for sticky footer */}
                  <Box sx={{ height: 72 }} />
                </Stack>
              </Scroll>
            </Stack>
          </Stack>
        )}
        {dialog}
      </Layout>
      <Stack
        sx={{
          overflow: "hidden",
          position: "fixed",
          right: 0,
          left: sm ? 0 : "auto",
          p: sm ? 2 : 3,
          bottom: 0,
        }}
      >
        {contentBottom}
      </Stack>
    </>
  );
}
