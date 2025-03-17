import { Box, Skeleton, Stack } from "@mui/material";
import { Item } from "components/Item";
import { PreviewCard } from "components/PreviewCard";
import Enter from "components/transitions/Enter";
import pluralize from "pluralize";
import { DATE_TIME_FORMAT, formatDate } from "utils/format";
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
            <PreviewCard instance={instance?.id} />
            <Item
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
                !isSubmissionLoading &&
                (submission?.createdAt || submission?.updatedAt) ? (
                  formatDate(
                    submission?.createdAt ?? submission?.updatedAt,
                    DATE_TIME_FORMAT
                  )
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
