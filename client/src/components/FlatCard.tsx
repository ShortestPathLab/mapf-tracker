import { Box, BoxProps, Card, CardProps } from "@mui/material";
import { useSm } from "./dialog/useSmallDisplay";

export function FlatCard({ children, ...props }: BoxProps & CardProps) {
  const sm = useSm() || true;
  return sm ? (
    <Box {...props} sx={{ m: -2, ...props.sx }}>
      {children}
    </Box>
  ) : (
    <Card {...props}>{children}</Card>
  );
}
