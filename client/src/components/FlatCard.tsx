import { Box, BoxProps, Card, CardProps } from "@mui/material";
import { ReactNode } from "react";
import { useSm } from "./dialog/useSmallDisplay";

export function FlatCard({ children, ...props }: BoxProps & CardProps) {
  const sm = useSm();
  return sm ? (
    <Box {...props} sx={{ m: -2, bgcolor: "background.default", ...props.sx }}>
      {children}
    </Box>
  ) : (
    <Card {...props}>{children}</Card>
  );
}
