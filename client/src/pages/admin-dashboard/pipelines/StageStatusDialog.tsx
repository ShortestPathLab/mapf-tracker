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
  const { status, description } = find(data, { key: stage }) ?? {};
  const { mutateAsync, isPending } = usePipelineRunMutation(stage);
  const notify = useSnackbar();
  return (
    <Stack sx={{ gap: 4 }}>
      <StageStatus stage={stage} sx={{ ml: -2 }} />
      <Button
        variant="contained"
        disabled={isPending || status?.type === "running"}
        onClick={async () => {
          notify("Scheduling run");
          await mutateAsync();
          notify("Scheduled run");
          onClose?.();
        }}
      >
        Run now
      </Button>
      {!!description && (
        <Prose sx={{ color: "text.secondary" }}>
          <Markdown>{description}</Markdown>
        </Prose>
      )}
      <GenericDetailsList data={status} sx={{ m: -2 }} />
    </Stack>
  );
}
