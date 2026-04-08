import {
  Avatar,
  Card,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Grid, Prose } from "layout";
import { filter } from "lodash";
import Content from "./about.mdx";
import { people } from "./people";
import { ArticleLayout } from "layout/ArticleLayout";
import { useSm } from "components/dialog/useSmallDisplay";
import { ArticleCard } from "../ArticleCard";
import { pages } from "../pages";

export function About() {
  const sm = useSm();
  return (
    <Stack direction={sm ? "column" : "row"} spacing={2}>
      <Stack sx={{ gap: 2, flex: 1 }}>
        <Prose>
          <Content />
        </Prose>
        <Stack sx={{ gap: 2 }}>
          <Typography variant="overline" color="text.secondary">
            Read the docs
          </Typography>
          <Grid width={280} gap={2}>
            {filter(pages(), (p) => ["cite"].includes(p.value)).map((page) => (
              <Tooltip key={page?.value} title="Open this article in a new tab">
                <ArticleCard
                  page={page}
                  onClick={() => open(`/docs/${page.value}`, "_blank")}
                />
              </Tooltip>
            ))}
          </Grid>
        </Stack>
      </Stack>
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
                ),
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
