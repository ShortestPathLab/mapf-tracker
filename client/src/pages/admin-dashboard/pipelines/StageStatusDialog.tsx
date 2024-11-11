import { Button, Stack, useTheme } from "@mui/material";
import { useSnackbar } from "components/Snackbar";
import { DialogContentProps } from "hooks/useDialog";
import GenericDetailsList from "pages/submission-summary/GenericDetailsList";
import {
  PipelineStageNodeData,
  usePipelineRunMutation,
  usePipelineStatus,
} from "queries/usePipelineQuery";
import { StageStatus } from "./StageStatus";
import { find } from "lodash";
import { Prose } from "layout";
import Markdown from "react-markdown";

export function StageStatusDialog({
  onClose,
  stage,
}: DialogContentProps & { stage?: string }) {
  const { data } = usePipelineStatus();
  const { status, description, destructive } = find(data, { key: stage }) ?? {};
  const { mutateAsync, isPending } = usePipelineRunMutation(stage);
  const notify = useSnackbar();
  return (
    <Stack sx={{ gap: 4 }}>
      <StageStatus stage={stage} sx={{ ml: -2 }} />
      <Stack sx={{ gap: 2 }}>
        <Button
          color={destructive ? "error" : "primary"}
          variant="contained"
          disabled={isPending || status?.type === "running"}
          onClick={async () => {
            notify("Scheduling run");
            await mutateAsync("run");
            notify("Scheduled run");
            onClose?.();
          }}
        >
          Run pipeline from this stage
        </Button>
        <Button
          color={destructive ? "error" : "primary"}
          variant="outlined"
          disabled={isPending || status?.type === "running"}
          onClick={async () => {
            notify("Scheduling run");
            await mutateAsync("runOne");
            notify("Scheduled run");
            onClose?.();
          }}
        >
          Run this stage only
        </Button>
      </Stack>
      {!!description && (
        <Prose sx={{ color: "text.secondary" }}>
          <Markdown>{description}</Markdown>
        </Prose>
      )}
      <GenericDetailsList data={status} sx={{ m: -2 }} />
    </Stack>
  );
}
