import { TabContext, TabPanel } from "@mui/lab";
import { Box, Stack, Tab, Tabs } from "@mui/material";
import { Scroll } from "components/dialog/Scrollbars";
import { useMd, useSm } from "components/dialog/useSmallDisplay";
import { useNavigate } from "hooks/useNavigation";
import { head } from "lodash";
import { matchPath, useLocation, useParams } from "react-router-dom";
import { pages } from "./pages";
import { navbarHeight } from "components/Navbar";
import { Router } from "components/Router";

export default function index() {
  const md = useMd();
  const { pathname } = useLocation();
  const match = matchPath("/dashboard/:section?/", pathname);
  const { section } = match?.params ?? {};
  const navigate = useNavigate();
  return (
    <TabContext value={section ?? head(pages()).value}>
      <Stack
        direction="row"
        sx={{
          height: "100%",
        }}
      >
        {!md && (
          <Tabs
            value={section ?? head(pages()).value}
            onChange={(_, v) => navigate(`/dashboard/${v}`)}
            orientation="vertical"
            sx={{
              py: 6,
              mt: `${navbarHeight(md)}px`,
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
        <Box
          sx={{
            flex: 1,
            overflow: "hidden",
            height: "100%",
            position: "relative",
          }}
        >
          <Router
            routes={pages().map(({ content, value }) => ({
              content: (
                <Box
                  sx={{
                    height: "100%",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                  }}
                >
                  {content}
                </Box>
              ),
              path: `/dashboard/${value}`,
              parent: value === "" ? "/" : "/dashboard/",
            }))}
          />
        </Box>
      </Stack>
    </TabContext>
  );
}
