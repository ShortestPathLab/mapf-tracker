import { FolderOutlined } from "@mui/icons-material";
import { Stack } from "@mui/material";
import { ReactNode } from "react";

export function IconCard({ icon = <FolderOutlined /> }: { icon?: ReactNode }) {
  return (
    <Stack
      sx={{ height: 72, color: "text.secondary", justifyContent: "center" }}
    >
      {icon}
    </Stack>
  );
}
