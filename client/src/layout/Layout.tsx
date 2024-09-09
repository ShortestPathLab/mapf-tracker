import { ArrowBackOutlined } from "@mui/icons-material";
import {
  Box,
  Card,
  Fade,
  IconButton,
  AppBar as MuiAppBar,
  Stack,
  StackProps,
  Toolbar,
  Typography,
  useScrollTrigger,
} from "@mui/material";
import AppBar, { appbarHeight } from "components/appbar";
import Enter from "components/dialog/Enter";
import { Scroll, useScroll } from "components/dialog/Scrollbars";
import { useLg, useMd, useSm } from "components/dialog/useSmallDisplay";
import { useNavigate } from "hooks/useNavigation";
import { last, merge, startCase } from "lodash";
import { ReactNode, useEffect } from "react";
import PageHeader, { PageHeaderProps } from "./PageHeader";
import { useScrollState } from "components/dialog/useScrollState";
import Appbar from "components/appbar";
import { Crumbs } from "./Crumbs";

type LayoutProps = {
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
  const md = useMd();
  const sm = useSm();
  const [, isTop, , , setPanel] = useScrollState(appbarHeight(md));
  const navigate = useNavigate();
  const header = <PageHeader {...{ current: title, path, description }} />;
  const content = (
    <Stack
      {...merge(
        {
          sx: {
            bgcolor: "background.default",
            gap: 4,
            px: sm ? 2 : 3,
            py: sm ? 2 : 3,
            maxWidth: width,
            mx: "auto",
          },
        },
        slotProps?.content
      )}
    >
      {render({
        header: !md || collapse ? header : undefined,
        children,
      })}
    </Stack>
  );
  return (
    <>
      {md &&
        (path?.length > 1 ? (
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
          <Appbar />
        ))}
      <Stack sx={{ flex: 1, height: "100%", overflow: "hidden" }}>
        {lg && <Box sx={{ height: appbarHeight(md) }} />}
        <Scroll y style={{ flex: 1 }} ref={(p) => setPanel(p)}>
          {!sm && <Crumbs path={path} current={title} />}
          {md ? (
            content
          ) : (
            <Enter in distance={4}>
              {content}
            </Enter>
          )}
          {md && <Box sx={{ height: 56 }} />}
        </Scroll>
      </Stack>
    </>
  );
}
