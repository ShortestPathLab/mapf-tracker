import { Box, Button, CircularProgress, Stack } from "@mui/material";
import { DataGridTitle } from "components/data-grid";
import { FlatCard } from "components/FlatCard";
import { DialogContentProps } from "hooks/useDialog";
import pluralize from "pluralize";
import { useScenarioData } from "queries/useBenchmarksQuery";
import GenericDetailsList from "../GenericDetailsList";
import { ScenarioLabel } from "./ScenarioLabel";
import { MapLabel } from "./MapLabel";
import {
  SubmissionInstanceProps,
  SubmissionInstanceContext,
} from "./SubmissionInstanceContext";

export function DetailsDialog({
  index,
  scenarioId,
  apiKey,
  slice,
}: SubmissionInstanceProps & DialogContentProps) {
  const { data: scenario } = useScenarioData(scenarioId);
  return (
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
              <DataGridTitle
                primary={pluralize("agent", instance?.agents, true)}
                secondary="Instance"
              />
            </Stack>
            <Button color="primary" variant="contained">
              Visualise this solution
            </Button>
            <FlatCard>
              <GenericDetailsList data={submission} />
            </FlatCard>
          </Stack>
        )
      }
    />
  );
}
