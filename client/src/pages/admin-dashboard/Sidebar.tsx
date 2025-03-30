import { Stack, StackProps, Tab, Tabs, Typography } from "@mui/material";
import { useSm } from "components/dialog/useSmallDisplay";
import { useNavigate } from "hooks/useNavigation";
import { head } from "lodash";
import { matchPath, useLocation } from "react-router-dom";
import { pages } from "./pages";

export function Sidebar(props: StackProps) {
  const lg = useSm();
  const { pathname } = useLocation();
  const match = matchPath("/sudo/:section?/", pathname);
  const { section } = match?.params ?? {};
  const navigate = useNavigate();
  return (
    !lg && (
      <Stack
        {...props}
        sx={{
          borderRight: (t) => `1px solid ${t.palette.divider}`,
          bgcolor: "background.paper",
          ...props.sx,
        }}
      >
        <Stack sx={{ p: 3 }}>
          <Typography variant="h6">Sudo</Typography>
        </Stack>
        <Tabs
          value={section ?? head(pages()).value}
          onChange={(_, v) => navigate(`/sudo/${v}`)}
          orientation="vertical"
        >
          {pages().map(({ value, label, description }) => (
            <Tab
              key={value}
              {...{ value, label, description }}
              iconPosition="start"
              sx={{ justifyContent: "flex-start", px: 3, minHeight: 56 }}
            />
          ))}
        </Tabs>
      </Stack>
    )
  );
}
