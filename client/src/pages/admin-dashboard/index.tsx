import { TabContext } from "@mui/lab";
import { Box, Stack } from "@mui/material";
import { Router } from "components/Router";
import Enter from "components/transitions/Enter";
import { head } from "lodash";
import { BlankPage } from "pages/Blank";
import { useCredentials } from "queries/useLogInQuery";
import { matchPath, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { pages } from "./pages";

export default function index() {
  const { data: credentials } = useCredentials();
  const { pathname } = useLocation();
  const match = matchPath("/dashboard/:section?/", pathname);
  const { section } = match?.params ?? {};
  return credentials ? (
    <TabContext value={section ?? head(pages()).value}>
      <Stack
        direction="row"
        sx={{
          height: "100%",
        }}
      >
        <Enter axis="X" in distance={-8}>
          <Box sx={{ height: "100%" }}>
            <Sidebar sx={{ height: "100%" }} />
          </Box>
        </Enter>
        <Box
          sx={{
            flex: 1,
            overflow: "hidden",
            height: "100%",
          }}
        >
          <Router
            routes={pages().map(({ content, value }) => ({
              content,
              path: `/dashboard/${value}`,
              parent: value === "" ? "/" : "/dashboard/",
            }))}
          />
        </Box>
      </Stack>
    </TabContext>
  ) : (
    <BlankPage />
  );
}
