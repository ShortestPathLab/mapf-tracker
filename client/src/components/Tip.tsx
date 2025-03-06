import { alpha, Fade, Stack, Typography } from "@mui/material";
import { ReactNode } from "react";
import { useOptions } from "utils/OptionsProvider";

export function Tip({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description: ReactNode;
  actions: ReactNode;
}) {
  const [{ hideTips }] = useOptions();
  return hideTips ? (
    <></>
  ) : (
    <Fade in>
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
    </Fade>
  );
}
