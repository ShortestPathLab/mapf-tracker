import { TabContext } from "@mui/lab";
import { Box, Stack, Tab, Tabs } from "@mui/material";
import { useMd } from "components/dialog/useSmallDisplay";
import { navbarHeight } from "components/Navbar";
import { Router } from "components/Router";
import { useNavigate } from "hooks/useNavigation";
import { head } from "lodash";
import { NotFoundPage } from "pages/NotFound";
import { useCredentials } from "queries/useLogInQuery";
import { matchPath, useLocation } from "react-router-dom";
import { pages } from "./pages";

export default function index() {
  const { data: credentials } = useCredentials();
  const md = useMd();
  const { pathname } = useLocation();
  const match = matchPath("/dashboard/:section?/", pathname);
  const { section } = match?.params ?? {};
  const navigate = useNavigate();
  return credentials ? (
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
  ) : (
    <NotFoundPage />
  );
}
