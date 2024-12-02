import {
  CancelOutlined,
  CheckCircleOutlined,
  PendingOutlined,
} from "@mui/icons-material";
import {
  CircularProgress,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import { identity, map, orderBy, startCase } from "lodash";
import prettyBytes from "pretty-bytes";
import { useOngoingSubmissionTicketQuery } from "queries/useOngoingSubmissionQuery";
import { paper } from "theme";
import pluralize from "pluralize";
import Enter from "components/dialog/Enter";

export function Tickets({ apiKey }: { apiKey?: string | number }) {
  const { data: tickets } = useOngoingSubmissionTicketQuery(apiKey);
  return (
    <Stack sx={{ gap: 2 }}>
      <Typography variant="h6">History</Typography>
      {tickets?.length ? (
        map(
          orderBy(tickets, ["dateReceived"], ["desc"]),
          ({ dateReceived, status, result, label, size }) => (
            <Enter axis="x" key={dateReceived} in>
              <ListItem sx={{ gap: 2, ...paper(0) }}>
                <ListItemIcon>
                  {{
                    done: <CheckCircleOutlined color="success" />,
                    error: <CancelOutlined color="error" />,
                    pending: <PendingOutlined color="warning" />,
                  }[status] ?? <CircularProgress size={24} />}
                </ListItemIcon>
                <ListItemText
                  sx={{ minWidth: "max-content", whiteSpace: "pre-line" }}
                  primary={label ?? "Submission"}
                  secondary={[
                    `${prettyBytes(size)}, ${format(
                      dateReceived,
                      "MMM dd HH:mm aaa"
                    )}`,
                    status === "done"
                      ? pluralize("entry", result?.count, true)
                      : {
                          done: "Done",
                          error: "Error",
                          pending: "Processing",
                          uploading: "Uploading",
                        }[status] ?? "-",
                  ]
                    .filter(identity)
                    .join("\n")}
                />
              </ListItem>
            </Enter>
          )
        )
      ) : (
        <Typography color="text.secondary">
          Previous uploads will appear here.
        </Typography>
      )}
    </Stack>
  );
}
