import { List, ListItem, ListItemText, ListProps } from "@mui/material";
import { entries, startCase } from "lodash";
import { CodeBlock } from "components/CodeBlock";

export default function GenericDetailsList({
  data,
  ...props
}: { data?: object } & ListProps) {
  return (
    <List {...props}>
      {entries(data).map(([k, v]) => (
        <ListItem key={k} disableGutters>
          <ListItemText
            secondary={startCase(k)}
            primary={
              <CodeBlock language="json">
                {JSON.stringify(v, null, 2)}
              </CodeBlock>
            }
          />
        </ListItem>
      ))}
    </List>
  );
}
