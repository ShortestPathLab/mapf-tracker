import { Box, Stack } from "@mui/material";
import React, { ReactNode } from "react";

type LabelProps = {
  primary?: ReactNode;
  secondary?: ReactNode;
};

export function Label({ primary, secondary }: LabelProps) {
  return (
    <Stack direction="row" gap={1}>
      <Box>{primary}</Box>
      <Box sx={{ color: "text.secondary" }}>{secondary}</Box>
    </Stack>
  );
}
