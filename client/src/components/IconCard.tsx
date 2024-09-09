import { FolderOutlined } from "@mui/icons-material";
import { Box, Card } from "@mui/material";
import { ReactNode } from "react";

export function IconCard({ icon = <FolderOutlined /> }: { icon?: ReactNode }) {
  return <Box sx={{ height: 72, color: "text.secondary" }}>{icon}</Box>;
}
