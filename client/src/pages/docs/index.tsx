import {
  Card,
  CardActionArea,
  CardMedia,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "hooks/useNavigation";
import { Grid, Layout } from "layout";
import { paper } from "theme";
import { pages } from "./pages";

export default function index() {
  const navigate = useNavigate();
  return (
    <Layout flat title="Docs" path={[{ name: "Home", url: "/" }]}>
      <Grid sx={{ gap: 2 }}>
        {pages.map(({ label, url, description, icon }) => (
          <Card key={label} sx={paper(0)}>
            <CardActionArea
              onClick={url ? () => navigate(url) : undefined}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "stretch",
              }}
            >
              <CardMedia
                sx={{
                  ...paper(1),
                  borderRadius: 0,
                  border: "none",
                  boxShadow: "none",
                  height: 120,
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "text.secondary",
                }}
              >
                {icon}
              </CardMedia>
              <Stack sx={{ p: 2 }}>
                <Typography gutterBottom variant="h5" component="div">
                  {label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {description}
                </Typography>
              </Stack>
            </CardActionArea>
          </Card>
        ))}
      </Grid>
    </Layout>
  );
}
