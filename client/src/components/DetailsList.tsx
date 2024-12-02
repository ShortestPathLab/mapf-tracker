import { List, ListItem, ListItemText, ListProps } from "@mui/material";
import { ReactNode } from "react";

export interface DetailsListProps {
  items?: { label: string; value: ReactNode }[];
}

export const DetailsList = ({
  items,
  ...rest
}: DetailsListProps & ListProps) => {
  return (
    <List {...rest}>
      {items.map((item, index) => (
        <ListItem key={index}>
          <ListItemText primary={item.value} secondary={item.label} />
        </ListItem>
      ))}
    </List>
  );
};
