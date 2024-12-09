import {
  CancelOutlined,
  CheckCircleOutlined,
  PendingOutlined,
} from "@mui/icons-material";
import {
  Box,
  CircularProgress,
  Link,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { Dialog } from "components/dialog";
import Enter from "components/transitions/Enter";
import { format } from "date-fns";
import { identity, map, orderBy } from "lodash";
import pluralize from "pluralize";
import prettyBytes from "pretty-bytes";
import { useOngoingSubmissionTicketQuery } from "queries/useOngoingSubmissionQuery";
import { paper } from "theme";
import GenericDetailsList from "./GenericDetailsList";

export function Tickets({ apiKey }: { apiKey?: string | number }) {
  const { data: tickets } = useOngoingSubmissionTicketQuery(apiKey);
  return (
    <Stack sx={{ gap: 2 }}>
      <Typography variant="h6">History</Typography>
      {tickets?.length ? (
        map(
          orderBy(tickets, ["dateReceived"], ["desc"]),
          ({ dateReceived, status, result, label, size, error }) => (
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
                  secondary={
                    <Stack>
                      {[
                        `${prettyBytes(size)}, ${format(
                          dateReceived,
                          "MMM dd HH:mm aaa"
                        )}`,
                        {
                          done: pluralize("entry", result?.count, true),
                          error: (
                            <Dialog
                              padded
                              slotProps={{ modal: { variant: "default" } }}
                              title="Error details"
                              trigger={(onClick) => (
                                <Link
                                  onClick={onClick}
                                  sx={{ cursor: "pointer" }}
                                >
                                  Error
                                </Link>
                              )}
                            >
                              <Typography>
                                Your file failed to pass schema validation. The
                                following is the error returned by the server.
                              </Typography>
                              <GenericDetailsList data={{ error }} />
                            </Dialog>
                          ),
                          pending: "Processing",
                          uploading: "Uploading",
                        }[status] ?? "-",
                      ]
                        .filter(identity)
                        .map((c, i) => (
                          <Box key={i}>{c}</Box>
                        ))}
                    </Stack>
                  }
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
