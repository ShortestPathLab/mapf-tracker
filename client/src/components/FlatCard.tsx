import { Box, BoxProps, CardProps } from "@mui/material";
import { useXs } from "./dialog/useSmallDisplay";

export function FlatCard({ children, ...props }: BoxProps & CardProps) {
  const xs = useXs();
  return xs ? (
    <Box {...props} sx={{ m: -2, ...props.sx }}>
      {children}
    </Box>
  ) : (
    children
  );
}
