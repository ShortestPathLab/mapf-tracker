import { Box, Button, CircularProgress, Stack } from "@mui/material";
import { Item } from "components/Item";
import { DialogContentProps, useDialog } from "hooks/useDialog";
import { Visualiser1 } from "pages/visualiser/Visualiser";
import pluralize from "pluralize";
import { useScenarioData } from "queries/useBenchmarksQuery";
import GenericDetailsList from "../GenericDetailsList";
import { MapLabel } from "./MapLabel";
import { ScenarioLabel } from "./ScenarioLabel";
import {
  SubmissionInstanceContext,
  SubmissionInstanceProps,
} from "./SubmissionInstanceContext";

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
        <Visualiser1 {...{ instanceId, solutionId, source }} />
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
  const { data: scenario } = useScenarioData(scenarioId);
  const { dialog, open } = useDialog(VisualisationDialog, {
    title: "Visualise solution",
    slotProps: {
      modal: {
        variant: "default",
        width: "100vw",
        fullScreen: true,
        scrollable: false,
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
              <GenericDetailsList data={submission} />
            </Stack>
          )
        }
      />
      {dialog}
    </>
  );
}
