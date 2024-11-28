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
import { format } from "date-fns";
import { capitalize, find, startCase } from "lodash";
import { usePipelineStatus } from "queries/usePipelineQuery";
import { Counter } from "../../../components/Counter";

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
              <>
                {"Running: "}
                <Counter start={timestamp} />
              </>
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
