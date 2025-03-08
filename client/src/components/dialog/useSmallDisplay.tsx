import { useMediaQuery, useTheme } from "@mui/material";

export function useLg() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down("xl"));
}
export function useSm() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down("lg"));
}
export function useXs() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down("sm"));
}
