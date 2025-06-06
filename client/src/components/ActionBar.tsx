import { Button, Stack, Typography } from "@mui/material";
import { ActionSheetProps } from "./ActionSheet";
import { Scroll } from "./dialog/Scrollbars";
import { useSm } from "./dialog/useSmallDisplay";

export function ActionBar({
  options,
  title = "Actions",
}: ActionSheetProps & { title?: string }) {
  "use no memo";

  const sm = useSm();
  return (
    <Stack
      sx={{
        gap: 1,
      }}
    >
      {!sm && (
        <Typography color="text.secondary" variant="overline" sx={{ mt: -1 }}>
          {title}
        </Typography>
      )}
      <Scroll x fadeX>
        <Stack
          sx={{
            gap: 1,
            "> button": {
              py: 1,
              px: 2,
              minWidth: "max-content",
            },
          }}
          direction="row"
        >
          {options?.map?.(({ label, icon, action, primary }, i) => (
            <Button
              key={i}
              startIcon={icon}
              variant={primary ? "contained" : "outlined"}
              color={primary ? "secondary" : "primary"}
              onClick={action}
            >
              {label}
            </Button>
          ))}
        </Stack>
      </Scroll>
    </Stack>
  );
}
