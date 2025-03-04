import {
  CheckCircleRounded,
  ErrorRounded,
  PendingRounded,
  RemoveRounded,
} from "@mui-symbols-material/w400";
import {
  CircularProgress,
  ListItem,
  ListItemIcon,
  ListItemProps,
  ListItemText,
} from "@mui/material";
import { format } from "date-fns";
import { capitalize, find, startCase } from "lodash";
import { usePipelineStatus } from "queries/usePipelineQuery";
import { DATE_TIME_FORMAT } from "utils/format";
import { Counter } from "../../../components/Counter";

const sentenceCase = (id: string) => capitalize(startCase(id));

export function StageStatus({
  stage,
  ...props
}: { stage: string } & ListItemProps) {
  const { data } = usePipelineStatus();
  const { timestamp = undefined, type = "invalidated" } =
    find(data, { key: stage })?.status ?? {};
  return (
    <ListItem {...props}>
      <ListItemIcon sx={{ mr: -2 }}>
        {
          {
            error: <ErrorRounded color="error" />,
            pending: <PendingRounded color="warning" />,
            running: (
              <CircularProgress
                sx={{ maxWidth: 24, maxHeight: 24 }}
                color="warning"
              />
            ),
            invalidated: <RemoveRounded color="disabled" />,
            done: <CheckCircleRounded color="success" />,
          }[type]
        }
      </ListItemIcon>
      <ListItemText
        primary={sentenceCase(stage)}
        secondary={
          timestamp ? (
            type === "running" ? (
              <>
                {"Running: "}
                <Counter start={timestamp} />
              </>
            ) : (
              `Last run: ${format(timestamp, DATE_TIME_FORMAT)}`
            )
          ) : (
            "Never run"
          )
        }
      />
    </ListItem>
  );
}
