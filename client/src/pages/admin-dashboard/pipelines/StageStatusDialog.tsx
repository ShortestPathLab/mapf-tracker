import { Button, Stack } from "@mui/material";
import { appbarHeight } from "components/appbar";
import { DetailsList } from "components/DetailsList";
import { useSnackbar } from "components/Snackbar";
import { DialogContentProps } from "hooks/useDialog";
import { Prose } from "layout";
import { find } from "lodash";
import {
  usePipelineRunMutation,
  usePipelineStatus,
} from "queries/usePipelineQuery";
import Markdown from "react-markdown";
import { useMeasure } from "react-use";
import { DATE_TIME_FORMAT, formatDate, prose } from "utils/format";
import { StageStatus } from "./StageStatus";

export function StageStatusDialog({
  onClose,
  stage,
}: DialogContentProps & { stage?: string }) {
  const { data } = usePipelineStatus();
  const { status, description, destructive, dependents } =
    find(data, { key: stage }) ?? {};
  const { mutateAsync, isPending } = usePipelineRunMutation(stage);
  const notify = useSnackbar();
  const [ref, { width }] = useMeasure();
  const sm = width < 960;
  return (
    <Stack sx={{ gap: 4 }} direction={sm ? "column" : "row"} ref={ref}>
      <Stack
        sx={{
          gap: 4,
          minWidth: "min(100%, 480px)",
          ...(!sm && {
            position: "sticky",
            top: (t) => `calc(${appbarHeight()}px + ${t.spacing(3)})`,
            height: "fit-content",
          }),
        }}
      >
        <StageStatus stage={stage} sx={{ ml: -2 }} />
        <Stack sx={{ gap: 2 }}>
          <Button
            color={destructive ? "error" : "secondary"}
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
      </Stack>
      <Stack sx={{ flex: 1, gap: 4 }}>
        {" "}
        {!!description && (
          <Prose sx={{ color: "text.secondary" }}>
            <Markdown>{description}</Markdown>
          </Prose>
        )}
        <DetailsList
          sx={{ m: -2 }}
          items={[
            { label: "Destructive", value: destructive ? "Yes" : "No" },
            { label: "Status", value: status?.type ?? "Never run" },
            {
              label: "Last completed run",
              value: formatDate(status?.timestamp, DATE_TIME_FORMAT),
            },
            {
              label: "Dependents",
              value: dependents?.length
                ? dependents.map(prose).join("\n")
                : "None",
            },
          ]}
        />
      </Stack>
    </Stack>
  );
}
