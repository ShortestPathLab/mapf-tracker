import {
  List,
  ListItem,
  ListItemText,
  ListProps,
  useTheme,
} from "@mui/material";
import { entries, startCase } from "lodash";
import { CodeBlock } from "./CodeBlock";

export default function GenericDetailsList({
  data,
  ...props
}: { data?: {} } & ListProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  return (
    <List {...props}>
      {entries(data).map(([k, v]) => (
        <ListItem>
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
