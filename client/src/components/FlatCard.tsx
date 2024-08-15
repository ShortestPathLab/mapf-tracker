import { Box, Card } from "@mui/material";
import { ReactNode } from "react";
import { useSm } from "./dialog/useSmallDisplay";

export function FlatCard({ children }: { children?: ReactNode }) {
  const sm = useSm();
  return sm ? (
    <Box sx={{ m: -2, bgcolor: "background.default" }}>{children}</Box>
  ) : (
    <Card>{children}</Card>
  );
}
