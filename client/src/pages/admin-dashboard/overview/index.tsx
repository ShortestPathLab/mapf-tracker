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
import { useNavigate } from "hooks/useNavigation";
import { Grid, Layout } from "layout";
import { filter } from "lodash";
import { useRequestsQuery } from "queries/useRequestsQuery";
import { pages } from "../pages";
import { useSm } from "components/dialog/useSmallDisplay";

const sections = () => {
  const [, ...rest] = pages();
  return rest;
};

export default function index() {
  const { data: requests } = useRequestsQuery();
  const navigate = useNavigate();
  const sm = useSm();
  return (
    <Layout width={960} title="Overview" path={[{ name: "Home", url: "/" }]}>
      <Stack gap={6}>
        <Grid>
          <Card sx={{ p: 4 }}>
            <Stack gap={4}>
              <Stack gap={1}>
                <Typography variant="h2">
                  {
                    filter(requests, {
                      reviewStatus: { status: "not-reviewed" },
                    })?.length
                  }
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Submission key requests awaiting review
                </Typography>
              </Stack>
              <Button
                variant="contained"
                sx={{ py: 2 }}
                onClick={() => navigate("/dashboard/submission-key-requests")}
              >
                See requests
              </Button>
            </Stack>
          </Card>
        </Grid>
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
