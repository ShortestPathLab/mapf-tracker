import { Stack } from "@mui/material";
import { Item } from "components/Item";
import { PreviewCard } from "components/PreviewCard";
import Enter from "components/transitions/Enter";
import pluralize from "pluralize";
import { formatDate } from "utils/format";
import {
  SubmissionInstanceContextParams,
  SubmissionInstanceContext,
} from "./SubmissionInstanceContextParams";

export function SubmissionInstanceLabel(
  props: SubmissionInstanceContextParams
) {
  return (
    <SubmissionInstanceContext {...props}>
      {({ isLoading, current }) => (
        <Enter axis="x" in={!isLoading}>
          <Stack
            direction="row"
            sx={{
              gap: 2,
              alignItems: "center",
            }}
          >
            <PreviewCard instance={current?.instance_id} />
            <Item
              primary={pluralize("agent", current?.agents ?? 0, true)}
              secondary={formatDate(current?.date)}
            />
          </Stack>
        </Enter>
      )}
    </SubmissionInstanceContext>
  );
}
