import { Theme, alpha } from "@mui/material";

export function getOutcomeDisplay(outcome?: string) {
  return (
    (outcome
      ? {
          valid: {
            color: "success.main",
            value: 1,
            label: "Valid",
          },
          invalid: {
            color: "error.main",
            value: 1,
            label: "Invalid",
          },
          queued: {
            color: (t: Theme) => alpha(t.palette.primary.main, 0.4),
            value: 0.1,
            label: "Running",
          },
          outdated: {
            color: "action.disabled",
            value: 1,
            label: "Unused - duplicate",
          },
        }[outcome]
      : undefined) ?? {
      color: "success.main",
      value: 0,
      label: "Pending",
    }
  );
}
