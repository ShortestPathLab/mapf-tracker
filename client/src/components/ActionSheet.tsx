import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { ReactNode } from "react";
import { SurfaceContentProps } from "./surface";

export function ActionSheet({
  options,
  onClose,
}: ActionSheetProps & SurfaceContentProps) {
  return (
    <List disablePadding sx={{ mt: -2 }}>
      {options?.map?.(({ label, icon, action }, i) => (
        <ListItemButton
          disableGutters
          key={i}
          onClick={() => {
            action?.();
            onClose?.();
          }}
        >
          <ListItemIcon>{icon}</ListItemIcon>
          <ListItemText>{label}</ListItemText>
        </ListItemButton>
      ))}
    </List>
  );
}
export type ActionSheetProps = {
  options?: {
    label: ReactNode;
    icon: ReactNode;
    primary?: boolean;
    action?: () => void;
  }[];
};
