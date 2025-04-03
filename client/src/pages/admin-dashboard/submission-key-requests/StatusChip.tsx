import { Chip, ChipProps, Stack } from "@mui/material";
import { Dot } from "components/Dot";
import { startCase } from "lodash";
import { ReviewOutcome } from "queries/useRequestsQuery";

export const StatusChip = ({
  status,
  ...props
}: { status?: ReviewOutcome["status"] } & ChipProps) => (
  <Chip
    label={
      <Stack direction="row" sx={{ alignItems: "center" }}>
        <Dot
          sx={{
            bgcolor: {
              rejected: "error.main",
              "not-reviewed": "warning.main",
              approved: "success.main",
            }[status] as "error" | "warning" | "success",
            mb: 0,
          }}
        />
        {startCase(status)}
      </Stack>
    }
    {...props}
  />
);
