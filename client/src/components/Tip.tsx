import { alpha, Stack, Typography } from "@mui/material";
import { ReactNode } from "react";

export function Tip({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description: ReactNode;
  actions: ReactNode;
}) {
  return (
    <Stack
      sx={{
        borderRadius: 1,
        p: 2,
        gap: 1,
        bgcolor: (t) => alpha(t.palette.primary.main, 0.05),
      }}
    >
      <Typography variant="overline" color="text.secondary" sx={{ mt: -1 }}>
        {title}
      </Typography>
      <Typography variant="body2">{description}</Typography>
      <Stack direction="row" gap={2}>
        {actions}
      </Stack>
    </Stack>
  );
}
