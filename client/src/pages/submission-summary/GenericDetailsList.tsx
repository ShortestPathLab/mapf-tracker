import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListProps,
  useTheme,
} from "@mui/material";
import { entries, startCase } from "lodash";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneLight,
  oneDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";

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
              <Box
                component="code"
                sx={{
                  whiteSpace: "pre-wrap",
                }}
              >
                <SyntaxHighlighter
                  language="json"
                  style={isDark ? oneDark : oneLight}
                >
                  {JSON.stringify(v, null, 2)}
                </SyntaxHighlighter>
              </Box>
            }
          />
        </ListItem>
      ))}
    </List>
  );
}
