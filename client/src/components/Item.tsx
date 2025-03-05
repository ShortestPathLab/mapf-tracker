import { ListItemText, Stack, Typography } from "@mui/material";
import { useSm } from "components/dialog/useSmallDisplay";
import { isNull, isUndefined, isNaN } from "lodash";
import { ReactNode } from "react";

export function Item({
  icon,
  primary,
  secondary,
  invert,
  disableMargin,
}: {
  icon?: ReactNode;
  primary?: ReactNode;
  secondary?: ReactNode;
  invert?: boolean;
  disableMargin?: boolean;
}) {
  const sm = useSm();
  return (
    <Stack
      direction="row"
      sx={{
        alignItems: "center",
        gap: 2,
      }}
    >
      {icon}
      <ListItemText
        sx={{
          my: disableMargin ? 0 : undefined,
          ...(invert && {
            display: "flex",
            flexDirection: "column-reverse",
          }),
        }}
        primary={
          primary && (
            <Typography variant="body1">
              {isNull(primary) || isUndefined(primary) || isNaN(primary)
                ? "-"
                : primary}
            </Typography>
          )
        }
        secondary={
          secondary && (
            <Typography
              variant={sm ? "body1" : "body2"}
              fontSize="0.875rem"
              color="text.secondary"
            >
              {secondary}
            </Typography>
          )
        }
      />
    </Stack>
  );
}
