import {
  Avatar,
  Card,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import { Prose } from "layout";
import { filter } from "lodash";
import Content from "./about.md";
import { people } from "./people";
import { ArticleLayout } from "layout/ArticleLayout";

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
      <Prose>
        <Content />
      </Prose>
      {["Advisors", "Developers"].map((group) => (
        <Card sx={{ py: 1, px: 1 }} key={group}>
          <Typography variant="h4" sx={{ px: 2, pt: 2 }}>
            {group}
          </Typography>
          <List>
            {filter(people, { group }).map(({ name, avatar, affiliation }) => (
              <ListItem key={name}>
                <ListItemAvatar>
                  <Avatar alt={name} src={avatar} />
                </ListItemAvatar>
                <ListItemText primary={`${name}`} secondary={affiliation} />
              </ListItem>
            ))}
          </List>
        </Card>
      ))}
    </ArticleLayout>
  );
}
