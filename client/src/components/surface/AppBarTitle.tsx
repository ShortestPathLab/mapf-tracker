import { Typography } from "@mui/material";
import { ReactNode } from "react";

export function AppBarTitle({ children }: { children?: ReactNode }) {
  return (
    <Typography
      sx={{
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
      component="div"
      variant="h6"
    >
      {children}
    </Typography>
  );
}
