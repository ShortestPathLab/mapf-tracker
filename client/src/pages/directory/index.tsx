import { Box, Card, CardActionArea, Stack, Typography } from "@mui/material";
import { useNavigationContent } from "components/appbar/useNavigationContent";
import { useNavigate } from "hooks/useNavigation";
import { Grid, Layout } from "layout";
import { LayoutProps } from "layout/Layout";
import { startsWith } from "lodash";
import { paper } from "theme";

export default function Page({
  labels = [],
  title = "Home",
  path = [],
  ...props
}: {
  labels?: string[];
} & LayoutProps) {
  const navigate = useNavigate();
  const { groups, logInDialog, userDialog } = useNavigationContent();
  return (
    <Layout flat title={title} path={path} root {...props}>
      {groups
        .filter(({ label }) => labels.includes(label))
        .map(({ label, items }, _, { length }) => (
          <Stack gap={2} key={label}>
            {length > 1 && (
              <Typography color="text.secondary">{label}</Typography>
            )}
            <Grid gap={2}>
              {items.map(
                ({ label, avatar, url, icon, action, description }) => (
                  <Card key={label} sx={paper(0)}>
                    <CardActionArea
                      onClick={
                        action
                          ? action
                          : url
                          ? startsWith(url, "http")
                            ? () => window.open(url)
                            : () => navigate(url)
                          : undefined
                      }
                      sx={{
                        p: 2,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        justifyContent: "flex-start",
                      }}
                    >
                      <Box sx={{ color: "text.secondary", pb: 2 }}>
                        {icon ?? avatar}
                      </Box>
                      <Typography variant="h6">{label}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {description}
                      </Typography>
                    </CardActionArea>
                  </Card>
                )
              )}
            </Grid>
          </Stack>
        ))}
      {logInDialog}
      {userDialog}
    </Layout>
  );
}
