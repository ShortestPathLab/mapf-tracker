import { Stack, Tab, Tabs, Typography } from "@mui/material";
import { useLg, useMd } from "components/dialog/useSmallDisplay";
import { useNavigate } from "hooks/useNavigation";
import { head } from "lodash";
import { matchPath, useLocation } from "react-router-dom";
import { pages } from "./pages";

export function Sidebar() {
  const lg = useLg();
  const { pathname } = useLocation();
  const match = matchPath("/dashboard/:section?/", pathname);
  const { section } = match?.params ?? {};
  const navigate = useNavigate();
  return (
    !lg && (
      <Stack
        sx={{
          bgcolor: "background.paper",
          borderRight: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Stack sx={{ p: 3 }}>
          <Typography variant="h6">Manage this platform</Typography>
        </Stack>
        <Tabs
          value={section ?? head(pages()).value}
          onChange={(_, v) => navigate(`/dashboard/${v}`)}
          orientation="vertical"
        >
          {pages().map(({ content, ...page }) => (
            <Tab
              {...page}
              iconPosition="start"
              sx={{ justifyContent: "flex-start", px: 3, minHeight: 64 }}
            />
          ))}
        </Tabs>
      </Stack>
    )
  );
}
