import { Stack, Typography } from "@mui/material";
import { useXs } from "components/dialog/useSmallDisplay";
import { appName, publisher } from "core/config";

export function Footer() {
  const xs = useXs();
  return (
    <Stack
      sx={{
        gap: 4,
        opacity: 0.5,
        bgcolor: (t) => t.palette.background.default,
        width: "100%",
        py: 3,
        mb: xs ? -2 : -3,
        boxShadow: (t) => `0 32px 0 32px ${t.palette.background.default}`,
      }}
    >
      <Typography variant="subtitle2" color="text.primary">
        {appName} by {publisher}
      </Typography>
    </Stack>
  );
}
