import { ArrowBackRounded } from "@mui-symbols-material/w400";
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
import { appbarHeight } from "components/appbar";
import Appbar from "components/appbar/index";
import { Scroll } from "components/dialog/Scrollbars";
import { useScrollState } from "components/dialog/useScrollState";
import { useLg, useXs } from "components/dialog/useSmallDisplay";
import Enter from "components/transitions/Enter";
import { useHistory, useNavigate } from "hooks/useNavigation";
import { last, merge } from "lodash";
import { ReactNode, createElement, useEffect } from "react";
import { Crumbs } from "./Crumbs";
import PageHeader, { PageHeaderProps } from "./PageHeader";

export type LayoutRenderProps = {
  header?: ReactNode;
  children?: ReactNode;
};

export type LayoutProps = {
  backBehaviour?: "back" | "up";
  disablePadding?: boolean;
  flat?: boolean;
  collapse?: boolean;
  width?: string | number;
  children?: ReactNode;
  render?: (components: LayoutRenderProps) => ReactNode;
  title?: string;
  description?: ReactNode;
  path?: PageHeaderProps["path"];
  slotProps?: {
    content?: StackProps;
  };
  root?: boolean;
};

const DefaultLayout = ({ header, children }) => (
  <>
    {header}
    {children}
  </>
);

export default function Layout({
  collapse = true,
  width = "none",
  render = DefaultLayout,
  title,
  path,
  children,
  slotProps,
  description,
  backBehaviour = "up",
  disablePadding,
  root,
  ...props
}: LayoutProps) {
  const lg = useLg();
  const md = useXs();
  const xs = useXs();
  const { location, action } = useHistory();
  const [, isTop, isAbsoluteTop, panel, setPanel] = useScrollState(
    appbarHeight(lg)
  );
  useEffect(() => {
    if (location.state?.session?.reason === "top" && action === "forward") {
      panel?.scrollTo?.({ top: 0, behavior: "smooth" });
    }
  }, [location, action]);
  const navigate = useNavigate();
  const header = <PageHeader {...{ current: title, path, description }} />;
  const content = (
    <Stack
      {...merge(
        {
          sx: {
            bgcolor: "background.paper",
            gap: 4,
            px: disablePadding ? 0 : xs ? 2 : 3,
            py: disablePadding ? 0 : xs ? 2 : 3,
            maxWidth: width,
            mx: "auto",
          },
        },
        slotProps?.content
      )}
    >
      {createElement(
        render,
        {
          header: !lg || collapse ? header : undefined,
          ...props,
        },
        children
      )}
    </Stack>
  );
  return (
    <>
      {xs &&
        (!root ? (
          <MuiAppBar
            position="fixed"
            sx={{ color: "text.primary", boxShadow: "none" }}
          >
            <Toolbar
              sx={{
                bgcolor: isAbsoluteTop
                  ? "background.paper"
                  : "background.default",
              }}
            >
              <IconButton
                edge="start"
                onClick={() => {
                  if (backBehaviour === "up") {
                    const { state, url } = last(path);
                    navigate(url, state);
                  } else {
                    navigate(-1);
                  }
                }}
              >
                <ArrowBackRounded />
              </IconButton>
              <Fade in={!isTop || !collapse}>
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {title}
                </Typography>
              </Fade>
            </Toolbar>
          </MuiAppBar>
        ) : (
          <Appbar
            sx={{
              bgcolor: isAbsoluteTop
                ? "background.paper"
                : "background.default",
            }}
          />
        ))}
      <Stack
        sx={{
          flex: 1,
          height: "100%",
          overflow: "hidden",
          bgcolor: "background.paper",
        }}
      >
        {xs && <Box sx={{ height: appbarHeight(lg) }} />}
        <Scroll
          y
          style={{ flex: 1, overscrollBehavior: "contain" }}
          ref={setPanel}
        >
          {!xs && <Crumbs path={path} current={title} />}
          {md ? (
            content
          ) : (
            <Enter in distance={4}>
              {content}
            </Enter>
          )}
          {md && <Box sx={{ height: 72 }} />}
          <Box sx={{ height: "calc(100lvh - 100svh)" }} />
        </Scroll>
      </Stack>
    </>
  );
}
