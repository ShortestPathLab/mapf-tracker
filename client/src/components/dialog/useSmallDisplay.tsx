import { useMediaQuery, useTheme } from "@mui/material";

export function useSm() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down("sm"));
}
export function useMd() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down("md"));
}
