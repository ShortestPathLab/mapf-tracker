import {
  CancelRounded,
  CheckCircleRounded,
  PendingRounded,
} from "@mui-symbols-material/w400";
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
import { Surface } from "components/surface";
import Enter from "components/transitions/Enter";
import { format } from "date-fns";
import { identity, map, orderBy } from "lodash";
import { bindTrigger } from "material-ui-popup-state";
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
                    done: <CheckCircleRounded color="success" />,
                    error: <CancelRounded color="error" />,
                    pending: <PendingRounded color="warning" />,
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
                            <Surface
                              title="Error details"
                              trigger={(state) => (
                                <Link
                                  {...bindTrigger(state)}
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
                            </Surface>
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
