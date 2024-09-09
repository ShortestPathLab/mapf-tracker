import { ChevronRightOutlined } from "@mui/icons-material";
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
      title="Dashboard"
      description="Review submission requests, issue submission keys, and run jobs"
      path={[{ name: "Home", url: "/" }]}
    >
      <Stack gap={6}>
        <Stack sx={{ gap: 3 }}>
          <Typography variant={sm ? "h4" : "h3"}>Requires attention</Typography>
          <Grid sx={{ gap: 2 }}>
            {[
              {
                primary: filter(requests, {
                  reviewStatus: { status: "not-reviewed" },
                })?.length,
                secondary: "Submission key requests awaiting review",
                action: () => navigate("/dashboard/submission-key-requests"),
                actionLabel: "See requests",
              },
              {
                primary: filter(pipelines, {
                  status: { type: "error" },
                })?.length,
                secondary: "Stages with error",
                action: () => navigate("/dashboard/pipelines"),
                actionLabel: "See pipelines",
              },
            ].map(
              ({ primary, secondary, action, actionLabel }) =>
                !!primary && (
                  <Card sx={{ p: sm ? 2 : 3 }}>
                    <Stack gap={sm ? 2 : 3}>
                      <Stack gap={1}>
                        <Typography variant="h2">{primary}</Typography>
                        <Typography color="text.secondary" variant="body2">
                          {secondary}
                        </Typography>
                      </Stack>
                      <Button
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
          <Typography variant={sm ? "h4" : "h3"}>
            Manage this platform
          </Typography>
          <List sx={{ mx: -2 }}>
            {sections().map(({ label, icon, value, description }) => (
              <>
                <ListItemButton onClick={() => navigate(`/dashboard/${value}`)}>
                  <ListItemIcon>{icon}</ListItemIcon>
                  <ListItemText primary={label} secondary={description} />
                  <ChevronRightOutlined />
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
