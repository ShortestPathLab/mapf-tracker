import { ArrowBackOutlined } from "@mui/icons-material";
import {
  Box,
  Fade,
  IconButton,
  AppBar as MuiAppBar,
  Stack,
  StackProps,
  Toolbar,
  Typography,
} from "@mui/material";
import Appbar, { appbarHeight } from "components/appbar";
import Enter from "components/dialog/Enter";
import { Scroll } from "components/dialog/Scrollbars";
import { useScrollState } from "components/dialog/useScrollState";
import { useLg, useXs } from "components/dialog/useSmallDisplay";
import { useNavigate } from "hooks/useNavigation";
import { last, merge, startCase } from "lodash";
import { ReactNode } from "react";
import { Crumbs } from "./Crumbs";
import PageHeader, { PageHeaderProps } from "./PageHeader";

export type LayoutProps = {
  flat?: boolean;
  collapse?: boolean;
  width?: string | number;
  children?: ReactNode;
  render?: (components: {
    header?: ReactNode;
    children?: ReactNode;
  }) => ReactNode;
  title?: string;
  description?: ReactNode;
  path?: PageHeaderProps["path"];
  slotProps?: {
    content?: StackProps;
  };
};

export default function Layout({
  collapse = true,
  width = "none",
  render = ({ header, children }) => (
    <>
      {header}
      {children}
    </>
  ),
  title,
  path,
  children,
  slotProps,
  description,
  flat,
}: LayoutProps) {
  const lg = useLg();
  const xs = useXs();
  const [, isTop, , , setPanel] = useScrollState(appbarHeight(lg));
  const navigate = useNavigate();
  const header = <PageHeader {...{ current: title, path, description }} />;
  const content = (
    <Stack
      {...merge(
        {
          sx: {
            bgcolor: "background.default",
            gap: 4,
            px: xs ? 2 : 3,
            py: xs ? 2 : 3,
            maxWidth: width,
            mx: "auto",
          },
        },
        slotProps?.content
      )}
    >
      {render({
        header: !lg || collapse ? header : undefined,
        children,
      })}
    </Stack>
  );
  return (
    <>
      {lg &&
        (path?.length > 0 ? (
          <MuiAppBar
            position="fixed"
            sx={{ color: "text.primary", boxShadow: "none" }}
          >
            <Toolbar
              sx={{
                bgcolor:
                  flat && isTop ? "background.default" : "background.paper",
              }}
            >
              <IconButton
                edge="start"
                onClick={() => {
                  const { state, url } = last(path);
                  navigate(url, state);
                }}
              >
                <ArrowBackOutlined />
              </IconButton>
              <Fade in={!isTop || !collapse}>
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {startCase(title)}
                </Typography>
              </Fade>
            </Toolbar>
          </MuiAppBar>
        ) : (
          <Appbar
            sx={{
              transition: (t) => t.transitions.create("background-color"),
              bgcolor:
                flat && isTop ? "background.default" : "background.paper",
            }}
          />
        ))}
      <Stack sx={{ flex: 1, height: "100%", overflow: "hidden" }}>
        {lg && <Box sx={{ height: appbarHeight(lg) }} />}
        <Scroll y style={{ flex: 1 }} ref={(p) => setPanel(p)}>
          {!lg && <Crumbs path={path} current={title} />}
          {lg ? (
            content
          ) : (
            <Enter in distance={4}>
              {content}
            </Enter>
          )}
          {lg && <Box sx={{ height: 72 }} />}
        </Scroll>
      </Stack>
    </>
  );
}
