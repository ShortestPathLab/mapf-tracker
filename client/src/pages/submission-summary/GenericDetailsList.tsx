import { List, ListItem, ListItemText, ListProps } from "@mui/material";
import { entries, startCase } from "lodash";
import { CodeBlock } from "components/CodeBlock";
import { dump } from "js-yaml";

export default function GenericDetailsList({ data, ...props }: { data?: object } & ListProps) {
  return (
    <List {...props}>
      {entries(data).map(([k, v]) => (
        <ListItem key={k} disableGutters>
          <ListItemText
            secondary={startCase(k)}
            primary={<CodeBlock language="yaml">{dump(v)}</CodeBlock>}
          />
        </ListItem>
      ))}
    </List>
  );
}
