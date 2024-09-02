import { useMediaQuery, useTheme } from "@mui/material";

export function useSm() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down("md"));
}
export function useMd() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down("lg"));
}
export function useLg() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down("lg"));
}
