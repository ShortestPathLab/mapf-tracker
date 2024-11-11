import { List, ListItem, ListItemText, ListProps } from "@mui/material";

export interface DetailsListProps {
  items?: { label: string; value: string }[];
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
