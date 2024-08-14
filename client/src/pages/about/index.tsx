import Layout from "layout/Layout";
import Prose from "layout/Prose";
import Content from "./about.md";
import {
  Avatar,
  Card,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import { filter } from "lodash";
import { people } from "./people";

export default function Page() {
  return (
    <Layout width={720} title="About" path={[{ name: "Home", url: "/" }]}>
      <Prose>
        <Content />
      </Prose>
      {["Advisors", "Developers"].map((group) => (
        <Card sx={{ py: 2, px: 2 }}>
          <Typography variant="h4" sx={{ px: 2, pt: 2 }}>
            {group}
          </Typography>
          <List>
            {filter(people, { group }).map(({ name, avatar, affiliation }) => (
              <ListItem>
                <ListItemAvatar>
                  <Avatar alt={name} src={avatar} />
                </ListItemAvatar>
                <ListItemText primary={`${name}`} secondary={affiliation} />
              </ListItem>
            ))}
          </List>
        </Card>
      ))}
    </Layout>
  );
}
