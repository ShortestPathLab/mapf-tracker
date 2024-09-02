import {
  CheckCircleOutlined,
  HighlightOffOutlined,
  PendingOutlined,
  RemoveCircleOutlineOutlined,
} from "@mui/icons-material";
import {
  CircularProgress,
  ListItem,
  ListItemIcon,
  ListItemProps,
  ListItemText,
} from "@mui/material";
import { format, formatDuration, intervalToDuration } from "date-fns";
import { capitalize, find, now, startCase } from "lodash";
import { usePipelineStatus } from "queries/usePipelineQuery";
import { useReducer } from "react";
import { useHarmonicIntervalFn } from "react-use";

function Counter({ start }: { start: number }) {
  const [time, tick] = useReducer(() => now(), now());
  useHarmonicIntervalFn(tick, 1000);
  return `Running: ${
    formatDuration(intervalToDuration({ start, end: time })) || "0 seconds"
  }`;
}

const sentenceCase = (id: string): any => capitalize(startCase(id));
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
            error: <HighlightOffOutlined color="error" />,
            pending: <PendingOutlined color="warning" />,
            running: (
              <CircularProgress
                sx={{ maxWidth: 24, maxHeight: 24 }}
                color="warning"
              />
            ),
            invalidated: <RemoveCircleOutlineOutlined color="disabled" />,
            done: <CheckCircleOutlined color="success" />,
          }[type]
        }
      </ListItemIcon>
      <ListItemText
        primary={sentenceCase(stage)}
        secondary={
          timestamp ? (
            type === "running" ? (
              <Counter start={timestamp} />
            ) : (
              `Last run: ${format(timestamp, "yyyy MMM dd HH:mm aaa")}`
            )
          ) : (
            "Never run"
          )
        }
      />
    </ListItem>
  );
}
