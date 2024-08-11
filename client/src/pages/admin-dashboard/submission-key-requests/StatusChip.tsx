import { Chip, ChipProps } from "@mui/material";
import { startCase } from "lodash";
import { ReviewOutcome } from "./useRequestsQuery";

export const StatusChip = ({
  status,
  ...props
}: { status?: ReviewOutcome["status"] } & ChipProps) => (
  <Chip
    label={startCase(status)}
    color={
      {
        rejected: "error",
        "not-reviewed": "warning",
        approved: "success",
      }[status] as "error" | "warning" | "success"
    }
    {...props}
  />
);
