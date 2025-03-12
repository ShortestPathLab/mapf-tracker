import { Box, Button, CircularProgress, Stack } from "@mui/material";
import { DetailsList } from "components/DetailsList";
import { Dot } from "components/Dot";
import { Item } from "components/Item";
import { Title } from "components/StickyTitle";
import { useSm } from "components/dialog/useSmallDisplay";
import { useSurface } from "components/surface";
import { formatDuration } from "date-fns";
import { DialogContentProps } from "hooks/useDialog";
import { capitalize, isNumber, map } from "lodash";
import { SolutionVisualisation } from "pages/visualiser/SolutionVisualisation";
import pluralize from "pluralize";
import { useScenarioDetailsData } from "queries/useBenchmarksQuery";
import { DATE_TIME_FORMAT, formatDate } from "utils/format";
import { MapLabel } from "./MapLabel";
import { ScenarioLabel } from "./ScenarioLabel";
import {
  SubmissionInstanceContext,
  SubmissionInstanceProps,
} from "./SubmissionInstanceContext";
import { getOutcomeDisplay } from "./getOutcomeDisplay";

function VisualisationDialog({
  instanceId,
  solutionId,
  source,
}: {
  instanceId?: string;
  solutionId?: string;
  source?: "ongoing" | "submitted";
} & DialogContentProps) {
  return (
    <>
      <Box
        sx={{
          position: "fixed",
          height: `100dvh`,
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          width: "100vw",
        }}
      >
        <SolutionVisualisation {...{ instanceId, solutionId, source }} />
      </Box>
      <Box sx={{ height: "100dvh" }}></Box>
    </>
  );
}

export function DetailsDialog({
  index,
  scenarioId,
  apiKey,
  slice,
}: SubmissionInstanceProps & DialogContentProps) {
  const sm = useSm();
  const { data: scenario } = useScenarioDetailsData(scenarioId);
  const { dialog, open } = useSurface(VisualisationDialog, {
    variant: "fullscreen",
    slotProps: {
      appBar: {
        sx: {
          background: "transparent",
          width: "fit-content",
        },
      },
    },
  });
  return (
    <>
      <SubmissionInstanceContext
        {...{ index, scenarioId, apiKey, slice }}
        render={({ instance, submission, isLoading }) =>
          isLoading ? (
            <CircularProgress />
          ) : (
            <Stack
              direction={sm ? "column" : "row"}
              sx={{
                gap: sm ? 4 : 3,
                "> *": { flex: 1, width: "100%", minWidth: 0 },
              }}
            >
              <Stack sx={{ gap: 2 }}>
                <MapLabel mapId={scenario?.map_id} />
                <ScenarioLabel scenarioId={scenarioId} />
                <Stack direction="row" sx={{ gap: 2, alignItems: "center" }}>
                  <Box sx={{ width: 48 }} />
                  <Item
                    primary={pluralize("agent", instance?.agents, true)}
                    secondary="Instance"
                  />
                </Stack>
                <Button
                  color="primary"
                  variant="contained"
                  onClick={() =>
                    open({
                      instanceId: instance?.id,
                      solutionId: submission?.id,
                      source: "ongoing",
                    })
                  }
                >
                  Visualise this solution
                </Button>
              </Stack>
              <Stack sx={{ gap: 2 }}>
                <Title>Validation</Title>
                <DetailsList
                  disablePadding
                  sx={{ mx: -2 }}
                  items={[
                    {
                      label: "Outcome",
                      value: (
                        <OutcomeDisplay
                          outcome={submission?.validation?.outcome}
                        />
                      ),
                    },
                    ...(submission?.validation?.errors?.length
                      ? [
                          {
                            label: "Errors",
                            value: map(
                              submission.validation.errors,
                              "label"
                            ).map((l, i) => <Box key={i}>{capitalize(l)}</Box>),
                          },
                        ]
                      : []),
                    {
                      label: "Submission time",
                      value: formatDate(
                        submission?.createdAt,
                        DATE_TIME_FORMAT
                      ),
                    },
                    {
                      label: "Validation time taken",
                      value: isNumber(submission?.validation?.timeTaken)
                        ? formatDuration({
                            seconds: submission.validation.timeTaken / 1000,
                          })
                        : "N/A",
                    },
                  ]}
                />
                <Title>Details</Title>
                <DetailsList
                  disablePadding
                  sx={{ mx: -2 }}
                  items={[
                    { label: "API key", value: submission?.apiKey },
                    { label: "Submission ID", value: submission?.id },
                    {
                      label: "Submission time",
                      value: formatDate(
                        submission?.createdAt,
                        DATE_TIME_FORMAT
                      ),
                    },
                    {
                      label: "Lower bound",
                      value: submission?.lowerBound,
                    },
                    { label: "Solution cost", value: submission?.cost },
                  ]}
                />
              </Stack>
            </Stack>
          )
        }
      />
      {dialog}
    </>
  );
}

function OutcomeDisplay({ outcome }: { outcome?: string }) {
  const { color, label } = getOutcomeDisplay(outcome);
  return (
    <Box component="span">
      <Dot sx={{ bgcolor: color }} />
      {label}
    </Box>
  );
}
