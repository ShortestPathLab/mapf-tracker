import {
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigationContent } from "components/appbar/useNavigationContent";
import { useNavigate } from "hooks/useNavigation";
import { Layout } from "layout";
import { LayoutProps } from "layout/Layout";
import { startsWith } from "lodash";

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
            <List disablePadding>
              {items.map(
                ({ label, avatar, url, icon, action, description }) => (
                  <ListItemButton
                    disableGutters
                    key={label}
                    onClick={
                      action
                        ? action
                        : url
                        ? startsWith(url, "http")
                          ? () => window.open(url)
                          : () => navigate(url)
                        : undefined
                    }
                  >
                    {icon ? (
                      <ListItemIcon>{icon}</ListItemIcon>
                    ) : (
                      <ListItemAvatar>{avatar}</ListItemAvatar>
                    )}
                    <ListItemText
                      primary={label}
                      secondary={description}
                    ></ListItemText>
                  </ListItemButton>
                )
              )}
            </List>
          </Stack>
        ))}
      {logInDialog}
      {userDialog}
    </Layout>
  );
}
