import { ListItemText, Typography } from "@mui/material";
import { useSm } from "components/dialog/useSmallDisplay";
import { ReactNode } from "react";

export function Item({
  primary,
  secondary,
  invert,
}: {
  primary?: ReactNode;
  secondary?: ReactNode;
  invert?: boolean;
}) {
  const sm = useSm();
  return (
    <ListItemText
      sx={
        invert && {
          display: "flex",
          flexDirection: "column-reverse",
        }
      }
      primary={primary && <Typography variant="body1">{primary}</Typography>}
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
  );
}
