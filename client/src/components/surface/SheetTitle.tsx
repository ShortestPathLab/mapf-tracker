import { CloseOutlined } from "@mui-symbols-material/w400";
import { IconButton, Stack } from "@mui/material";
import { useSm } from "components/dialog/useSmallDisplay";
import { ReactNode } from "react";
import { AppBarTitle as Title } from "./AppBarTitle";

export const sheetTitleHeight = 56;

export function SheetTitle({
  children,
  onClose,
}: {
  children?: ReactNode;
  onClose?: () => void;
}) {
  const sm = useSm();
  return children ? (
    <Stack
      direction="row"
      sx={{ px: sm ? 2 : 3, alignItems: "center", gap: 1, pb: 2 }}
    >
      <IconButton edge="start" onClick={onClose}>
        <CloseOutlined color="action" />
      </IconButton>
      {typeof children === "string" ? <Title>{children}</Title> : children}
    </Stack>
  ) : null;
}
