import { ChevronRightRounded } from "@mui-symbols-material/w400";
import {
  Button,
  Card,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useSm } from "components/dialog/useSmallDisplay";
import { useNavigate } from "hooks/useNavigation";
import { Grid, Layout } from "layout";
import { filter } from "lodash";
import { useRequestsQuery } from "queries/useRequestsQuery";
import { pages } from "../pages";
import { usePipelineStatus } from "queries/usePipelineQuery";
import { paper } from "theme";
import { Title } from "components/StickyTitle";

const sections = () => {
  const [, ...rest] = pages();
  return rest;
};

export default function index() {
  const { data: requests } = useRequestsQuery();
  const { data: pipelines } = usePipelineStatus();
  const navigate = useNavigate();
  const sm = useSm();
  return (
    <Layout
      flat
      title="Sudo"
      description="Review submission requests, issue submission keys, and run jobs"
      path={[{ name: "More", url: "/more" }]}
    >
      <Stack gap={6}>
        <Stack sx={{ gap: 3 }}>
          <Title sticky>Requires attention</Title>
          <Grid sx={{ gap: 2 }}>
            {[
              {
                primary: filter(requests, {
                  reviewStatus: { status: "not-reviewed" },
                })?.length,
                secondary: "Submission key requests awaiting review",
                action: () => navigate("/sudo/submission-key-requests"),
                actionLabel: "See requests",
              },
              {
                primary: filter(pipelines, {
                  status: { type: "error" },
                })?.length,
                secondary: "Stages with error",
                action: () => navigate("/sudo/pipelines"),
                actionLabel: "See pipelines",
              },
            ].map(
              ({ primary, secondary, action, actionLabel }) =>
                !!primary && (
                  <Card sx={{ p: sm ? 2 : 3, ...paper(0) }} key={secondary}>
                    <Stack gap={sm ? 2 : 3}>
                      <Stack gap={1}>
                        <Typography variant="h2">{primary}</Typography>
                        <Typography color="text.secondary" variant="body2">
                          {secondary}
                        </Typography>
                      </Stack>
                      <Button
                        color="secondary"
                        variant="contained"
                        sx={{ py: 2 }}
                        onClick={action}
                      >
                        {actionLabel}
                      </Button>
                    </Stack>
                  </Card>
                )
            )}
          </Grid>
        </Stack>
        <Stack sx={{ gap: 2 }}>
          <Title sticky>Manage</Title>
          <List sx={{ mx: -2 }}>
            {sections().map(({ label, icon, value, description }) => (
              <>
                <ListItemButton onClick={() => navigate(`/sudo/${value}`)}>
                  <ListItemIcon>{icon}</ListItemIcon>
                  <ListItemText primary={label} secondary={description} />
                  <ChevronRightRounded sx={{ ml: 2 }} />
                </ListItemButton>
                <Divider variant="inset" component="li" />
              </>
            ))}
          </List>
        </Stack>
      </Stack>
    </Layout>
  );
}
