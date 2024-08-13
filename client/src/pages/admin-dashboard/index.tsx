import { TabContext, TabPanel } from "@mui/lab";
import { Box, Stack, Tab, Tabs } from "@mui/material";
import { Scroll } from "components/dialog/Scrollbars";
import { useMd, useSm } from "components/dialog/useSmallDisplay";
import { useNavigate } from "hooks/useNavigation";
import { head } from "lodash";
import { useParams } from "react-router-dom";
import { pages } from "./pages";
import { navbarHeight } from "components/Navbar";

export default function index() {
  const md = useMd();
  const sm = useSm();
  const { section } = useParams();
  const navigate = useNavigate();
  return (
    <TabContext value={section ?? head(pages()).value}>
      <Stack
        direction="row"
        sx={{
          position: "fixed",
          top: navbarHeight(sm),
          left: 0,
          bottom: 0,
          right: 0,
        }}
      >
        {!md && (
          <Tabs
            value={section ?? head(pages()).value}
            onChange={(_, v) => navigate(`/dashboard/${v}`)}
            orientation="vertical"
            sx={{
              py: 6,
              borderRight: (t) => `1px solid ${t.palette.divider}`,
            }}
          >
            {pages().map(({ content, ...page }) => (
              <Tab
                {...page}
                iconPosition="start"
                sx={{ justifyContent: "flex-start", px: 3, minHeight: 64 }}
              />
            ))}
          </Tabs>
        )}
        <Box sx={{ flex: 1, overflow: "hidden", height: "100%" }}>
          {pages().map(({ value, content }) => (
            <TabPanel value={value} sx={{ p: 0, height: "100%" }}>
              <Scroll y style={{ height: "100%" }}>
                <Box sx={{ py: md ? 2 : 3 }}>{content}</Box>
              </Scroll>
            </TabPanel>
          ))}
        </Box>
      </Stack>
    </TabContext>
  );
}
