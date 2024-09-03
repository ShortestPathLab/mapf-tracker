import { List, ListItem, ListItemText, Stack, Typography } from "@mui/material";
import Grid from "layout/Grid";
import { head, map, orderBy, sortBy } from "lodash";
import { useAlgorithmForInstanceData } from "queries/useAlgorithmQuery";
import { formatDate } from "utils/format";

export default function Details({ id }: { id?: string }) {
  const { data } = useAlgorithmForInstanceData(id);
  return (
    <Grid>
      {map(
        [
          {
            name: "Lower-bound record claims",
            collection: head(data)?.lower_algos,
          },
          {
            name: "Solution record claims",
            collection: head(data)?.solution_algos,
          },
        ],
        ({ name, collection }) => (
          <Stack>
            <Typography variant="h6" sx={{ px: 2, pt: 2 }}>
              {name}
            </Typography>
            <List>
              {map(
                orderBy(collection, "date", "desc"),
                ({ algo_name, date, value }) => (
                  <ListItem>
                    <ListItemText
                      secondary={`${value} on ${formatDate(date)}`}
                      primary={algo_name}
                    />
                  </ListItem>
                )
              )}
            </List>
          </Stack>
        )
      )}
    </Grid>
  );
}
