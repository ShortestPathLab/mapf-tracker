import { FolderOutlined } from "@mui/icons-material";
import { Card } from "@mui/material";
import { ReactNode } from "react";

export function IconCard({ icon = <FolderOutlined /> }: { icon?: ReactNode }) {
  return (
    <Card
      sx={{
        lineHeight: 0,
        border: (t) => `1px solid ${t.palette.divider}`,
        p: 2,
        width: "fit-content",
        height: "fit-content",
      }}
    >
      {icon}
    </Card>
  );
}
