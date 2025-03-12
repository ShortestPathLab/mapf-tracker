import {
  Stack,
  StackProps,
  Tab,
  Tabs,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { useSm } from "components/dialog/useSmallDisplay";
import { useNavigate } from "hooks/useNavigation";
import { head } from "lodash";
import { matchPath, useLocation } from "react-router-dom";
import { pages } from "./pages";

export function Sidebar(props: StackProps) {
  const lg = useSm();
  const { pathname } = useLocation();
  const match = matchPath("/dashboard/:section?/", pathname);
  const { section } = match?.params ?? {};
  const navigate = useNavigate();
  const theme = useTheme();
  return (
    !lg && (
      <Stack
        {...props}
        sx={{
          bgcolor: alpha(theme.palette.background.default, 0.5),
          ...props.sx,
        }}
      >
        <Stack sx={{ p: 3 }}>
          <Typography variant="h6">Manage</Typography>
        </Stack>
        <Tabs
          value={section ?? head(pages()).value}
          onChange={(_, v) => navigate(`/dashboard/${v}`)}
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
