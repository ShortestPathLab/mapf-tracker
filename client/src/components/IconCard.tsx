import { FolderRounded } from "@mui-symbols-material/w400";
import { Stack } from "@mui/material";
import { ReactNode } from "react";

export function IconCard({ icon = <FolderRounded /> }: { icon?: ReactNode }) {
  return (
    <Stack
      sx={{ height: 72, color: "text.secondary", justifyContent: "center" }}
    >
      {icon}
    </Stack>
  );
}
