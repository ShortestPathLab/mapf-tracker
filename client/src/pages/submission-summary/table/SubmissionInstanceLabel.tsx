import { Box, Skeleton, Stack } from "@mui/material";
import { DataGridTitle } from "components/data-grid";
import Enter from "components/dialog/Enter";
import { format, parseISO } from "date-fns";
import pluralize from "pluralize";
import {
  SubmissionInstanceContext,
  SubmissionInstanceProps,
} from "./SubmissionInstanceContext";

export function SubmissionInstanceLabel(props: SubmissionInstanceProps) {
  return (
    <SubmissionInstanceContext
      {...props}
      render={({ isLoading, isSubmissionLoading, submission, instance }) => (
        <Enter in axis="x" key={submission?.id}>
          <Stack
            direction="row"
            sx={{
              gap: 2,
              alignItems: "center",
            }}
          >
            <Box sx={{ width: 48 }} />
            <DataGridTitle
              primary={
                isLoading ? (
                  <Skeleton sx={{ width: 120 }} />
                ) : (
                  <Box
                    component="span"
                    sx={{
                      textDecoration:
                        submission?.validation?.outcome === "outdated"
                          ? "line-through"
                          : undefined,
                    }}
                  >
                    {pluralize("agent", instance?.agents ?? 0, true)}
                  </Box>
                )
              }
              secondary={
                !isSubmissionLoading && submission?.createdAt ? (
                  format(parseISO(submission?.createdAt), "MMM dd HH:mm aaa")
                ) : (
                  <Skeleton sx={{ width: 80 }} />
                )
              }
            />
          </Stack>
        </Enter>
      )}
    />
  );
}
