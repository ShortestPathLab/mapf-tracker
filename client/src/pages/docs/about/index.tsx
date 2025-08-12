import {
  Avatar,
  Card,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { Prose } from "layout";
import { filter } from "lodash";
import Content from "./about.md";
import { people } from "./people";
import { ArticleLayout } from "layout/ArticleLayout";
import { useSm } from "components/dialog/useSmallDisplay";

export function About() {
  const sm = useSm();
  return (
    <Stack direction={sm ? "column" : "row"} spacing={2}>
      <Prose sx={{ flex: 1 }}>
        <Content />
      </Prose>
      <Stack sx={{ flex: 1, gap: 2 }}>
        {["Advisors", "Developers"].map((group) => (
          <Card sx={{ py: 1, px: 1 }} key={group}>
            <Typography variant="h5" component="h4" sx={{ px: 2, pt: 2 }}>
              {group}
            </Typography>
            <List>
              {filter(people, { group }).map(
                ({ name, avatar, affiliation }) => (
                  <ListItem key={name}>
                    <ListItemAvatar>
                      <Avatar alt={name} src={avatar} />
                    </ListItemAvatar>
                    <ListItemText primary={`${name}`} secondary={affiliation} />
                  </ListItem>
                )
              )}
            </List>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}

export default function Page() {
  return (
    <ArticleLayout
      title="About"
      subtitle="About the MAPF Tracker"
      path={[
        { name: "Home", url: "/" },
        { name: "Docs", url: "/docs" },
      ]}
    >
      <About />
    </ArticleLayout>
  );
}
