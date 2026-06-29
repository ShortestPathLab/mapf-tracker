import { CheckRounded, WarningRounded } from "@mui-symbols-material/w300";
import { alpha, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useSnackbar } from "components/Snackbar";
import { Title } from "components/StickyTitle";
import { ConfirmDialog } from "components/dialog/Modal";
import { useXs } from "components/dialog/useSmallDisplay";
import { useSurface } from "components/surface/useSurface";
import { useNavigate } from "hooks/useNavigation";
import { useStableLocationState } from "hooks/useStableLocationState";
import { BentoLayout } from "layout/BentoLayout";
import { filter, sumBy } from "lodash";
import { SubmissionLocationState } from "pages/submissions/SubmissionLocationState";
import {
  useFinaliseOngoingSubmissionMutation,
  useOngoingSubmissionSummaryQuery,
  useOngoingSubmissionTicketQuery,
} from "queries/useOngoingSubmissionQuery";
import { useRequestData } from "queries/useRequestQuery";
import { useSubmissionKeyQuery } from "queries/useSubmissionKeyQuery";
import { Fragment, useEffect } from "react";
import { Actions } from "./Actions";
import { SubmissionRequestGlance } from "./SubmissionRequestGlance";
import SubmissionSummary from "./SubmissionSummary";
import { Tickets } from "./Tickets";
import { parseApiKeyStatus } from "./parseApiKeyStatus";
import SummaryTable from "./table/SummaryTable";
import { Loading } from "components/LoadingLong";

const hintText =
  "You will not be able to edit this submission after it has been submitted. To make a new submission, you must request a new submission key. \n\nInvalid or dominated entries will be ignored.";

export default function SubmissionSummaryPage() {
  const { apiKey } = useStableLocationState<SubmissionLocationState>();
  const {
    data,
    isLoading: summaryIncomplete,
    isEmpty: summaryEmpty,
  } = useOngoingSubmissionSummaryQuery(apiKey);
  const { data: apiKeyData, isLoading, error } = useSubmissionKeyQuery(apiKey);
  const { data: requestData } = useRequestData(apiKey);
  const { mutate: finalise } = useFinaliseOngoingSubmissionMutation(apiKey);
  const { data: isPending } = useOngoingSubmissionTicketQuery(apiKey);
  const someIsPending = !!filter(isPending, (p) => p.status === "pending").length;
  const { open, close, dialog } = useSurface(ConfirmDialog, {
    title: "Finish submission",
    variant: "modal",
  });
  const notify = useSnackbar();
  const navigate = useNavigate();

  const keyStatus = parseApiKeyStatus(apiKeyData);

  const xs = useXs();

  const contentLeft = [
    <SubmissionRequestGlance key="glance" apiKey={apiKey} />,
    <Actions key="actions" apiKey={apiKey} />,
    <Tickets key="tickets" apiKey={apiKey} />,
    <Box key="gap" sx={{ height: 72 }} />,
  ];

  useEffect(() => {
    if (!isLoading && error) {
      notify(error.toString());
      navigate("/track");
    }
  }, [
	isLoading,
	error,
	notify,
	navigate
]);

  const contentBottom = [
    <Button
      key="submit"
      color="secondary"
      startIcon={<CheckRounded />}
      disabled={keyStatus === "submitted" || keyStatus === "expired"}
      variant="contained"
      disableElevation
      size="large"
      sx={{ alignSelf: xs ? "stretch" : "flex-end" }}
      onClick={() =>
        open({
          hintText,
          acceptLabel: "Submit now",
          closeLabel: "Cancel",
          onAccept: () => {
            finalise();
            close();
            navigate("/track");
          },
          onClose: close,
        })
      }
    >
      Finish submission
    </Button>,
  ];

  const isIncomplete = summaryIncomplete || someIsPending;
  const contentRight = [
    <Fragment key="incomplete">
      {isIncomplete && (
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            borderRadius: 1,
            p: 2,
            gap: 2,
            bgcolor: (t) => alpha(t.palette.warning.main, 0.05),
          }}
        >
          <WarningRounded color="warning" />
          <Typography variant="body2">
            This is an incomplete list, hold on while we count your submissions
          </Typography>
        </Stack>
      )}
    </Fragment>,
    <SubmissionSummary
      key="summary"
      summaryStats={[
        {
          label: "Progress",
          values: [
            {
              name: "Received",
              count: sumBy(data?.processed?.maps, "count.total"),
            },
            {
              name: "Queued",
              count: sumBy(data?.processed?.maps, "count.queued"),
            },
            {
              name: "Run",
              count:
                sumBy(data?.processed?.maps, "count.total") -
                sumBy(data?.processed?.maps, "count.queued"),
            },
          ],
        },
        {
          label: "Validity",
          values: [
            {
              name: "Valid",
              count: sumBy(data?.processed?.maps, "count.valid"),
            },
            {
              name: "Invalid",
              count: sumBy(data?.processed?.maps, "count.invalid"),
            },
            {
              name: "Duplicate",
              count: sumBy(data?.processed?.maps, "count.outdated"),
            },
          ],
        },
        {
          label: "Solution novelty",
          values: [
            {
              name: "Best",
              count: sumBy(data?.processed?.maps, "count.best"),
            },
            {
              name: "Tie",
              count: sumBy(data?.processed?.maps, "count.tie"),
            },
            {
              name: "Dominated",
              count: sumBy(data?.processed?.maps, "count.dominated"),
            },
          ],
        },
        {
          label: "Lower-bound novelty",
          values: [
            {
              name: "Best",
              count: sumBy(data?.processed?.maps, "count.lb_best"),
            },
            {
              name: "Tie",
              count: sumBy(data?.processed?.maps, "count.lb_tie"),
            },
            {
              name: "Dominated",
              count: sumBy(data?.processed?.maps, "count.lb_dominated"),
            },
          ],
        },
      ]}
      detailStats={[]}
      extras={[]}
    >
      <Stack
        sx={{
          gap: 2,
          "& .MuiDataGrid-footerContainer": {
            bottom: "96px !important",
          },
        }}
      >
        <Title>Details</Title>
        {/* <DataGrid clickable columns={columns} rows={data} /> */}
        {!(isIncomplete && summaryEmpty) ? <SummaryTable apiKey={apiKey} /> : <Loading />}
      </Stack>
    </SubmissionSummary>,
    <Box key="gap" sx={{ height: "100dvh" }} />,
    <Stack
      key="bottom"
      sx={{
        alignItems: "flex-end",
        justifyContent: "center",
        height: 104,
        position: "sticky",
        bottom: 0,
        bgcolor: "background.paper",
      }}
    >
      {contentBottom}
    </Stack>,
  ];

  const props = {
    flat: true,
    title: requestData?.algorithmName ?? "Submit data",
    path: [
      { name: "Home", url: "/" },
      { name: "Submissions and API keys", url: "/track" },
    ],
    contentLeft,
    contentRight,
    labelLeft: "Upload data",
    labelRight: "Validation progress",
  };

  return isLoading ? (
    <BentoLayout
      {...props}
      contentLeft={<CircularProgress />}
      contentRight={<CircularProgress />}
    />
  ) : (
    <>
      <BentoLayout {...props} />
      {dialog}
    </>
  );
}
