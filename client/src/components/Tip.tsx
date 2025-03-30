import { alpha, Stack, Typography } from "@mui/material";
import { ReactNode } from "react";
import { useOptions } from "utils/OptionsProvider";
import Enter from "./transitions/Enter";
import { Scroll } from "./dialog/Scrollbars";

export function Tip({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description: ReactNode;
  actions?: ReactNode;
}) {
  const [{ hideTips }] = useOptions();
  return (
    <Enter axis="x" mountOnEnter unmountOnExit in={!hideTips} appear={false}>
      <Stack
        sx={{
          borderRadius: 1,
          p: 2,
          gap: 1,
          bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
        }}
      >
        <Typography variant="overline" color="text.secondary" sx={{ mt: -1 }}>
          {title}
        </Typography>
        <Typography variant="body2">{description}</Typography>
        {actions && (
          <Scroll x fadeX>
            <Stack
              direction="row"
              sx={{
                gap: 1,
                pt: 1,
                "> button": {
                  border: (t) => `1px solid ${t.palette.divider}`,
                  // boxShadow: (t) => t.shadows[1],
                  px: 2,
                  minWidth: "max-content",
                },
              }}
            >
              {actions}
            </Stack>
          </Scroll>
        )}
      </Stack>
    </Enter>
  );
}
