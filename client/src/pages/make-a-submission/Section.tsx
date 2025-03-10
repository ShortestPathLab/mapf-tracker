import { ArrowBackRounded } from "@mui-symbols-material/w400";
import {
  ButtonBase,
  IconButton,
  Stack,
  Typography,
  useForkRef,
} from "@mui/material";
import { appbarHeight } from "components/appbar";
import { useSm, useXs } from "components/dialog/useSmallDisplay";
import { useNavigate } from "hooks/useNavigation";
import { bottomBarHeight } from "layout/navbarHeight";
import { ReactNode, useRef } from "react";
import { useHarmonicIntervalFn } from "react-use";

export function RenderSection({ children, header }) {
  const sm = useSm();
  const navigate = useNavigate();
  return (
    <SectionContent>
      <Stack sx={{ gap: 4 }}>
        {!sm && (
          <IconButton
            edge="start"
            onClick={() => navigate(-1)}
            sx={{ alignSelf: "flex-start" }}
          >
            <ArrowBackRounded />
          </IconButton>
        )}
        {header}
        {children}
      </Stack>
    </SectionContent>
  );
}

export function Section({
  primary,
  secondary,
  icon,
  children,
  contentRef,
}: {
  primary?: ReactNode;
  secondary?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
  contentRef?: React.ForwardedRef<HTMLDivElement>;
}) {
  const xs = useXs();
  const content = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLButtonElement>(null);
  const contentFork = useForkRef<HTMLDivElement>(content, contentRef);
  useHarmonicIntervalFn(
    () =>
      requestAnimationFrame(() => {
        if (title.current) {
          const titleRect = title.current.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          title.current.style.zIndex =
            titleRect && titleRect.top >= viewportHeight / 2
              ? `${
                  500 -
                  Array.prototype.indexOf.call(
                    title.current.parentElement.children,
                    title.current
                  )
                }`
              : `500`;
        }
      }),
    1000 / 15
  );

  return (
    <>
      <ButtonBase
        ref={title}
        onClick={() =>
          content?.current?.scrollIntoView?.({ behavior: "smooth" })
        }
        sx={{
          borderTop: (t) => `1px solid ${t.palette.divider}`,
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
          "&:first-child": { borderTop: "none" },
          "&:last-child": { borderBottom: "none" },
          height: 72,
          position: "sticky",
          top: 0,
          bottom: 0,
          px: xs ? 2 : 3,
          alignItems: "center",
          bgcolor: "background.default",
          justifyContent: "flex-start",
        }}
      >
        <SectionTitle {...{ icon, primary, secondary }} />
      </ButtonBase>
      <Stack ref={contentFork} sx={{ scrollMarginTop: 72, gap: 2 }}>
        <SectionContent>
          <Typography sx={{ mb: 4 }} variant="h2">
            {primary}
          </Typography>

          {children}
        </SectionContent>
      </Stack>
    </>
  );
}
export function SectionContent({ children }: { children?: ReactNode }) {
  const xs = useXs();
  const sm = useSm();
  return (
    <Stack
      sx={{
        width: 960,
        maxWidth: "100%",
        mx: "auto",
        py: xs ? 4 : 6,
        minHeight: `calc(100vh - ${
          appbarHeight(sm) + 68 * 2 + bottomBarHeight(sm)
        }px)`,
      }}
    >
      <Stack sx={{ p: xs ? 2 : 3 }}>{children}</Stack>
    </Stack>
  );
}
function SectionTitle({
  primary,
  secondary,
  icon,
}: {
  primary?: ReactNode;
  secondary?: ReactNode;
  icon?: ReactNode;
}) {
  const xs = useXs();
  return (
    <Stack sx={{ gap: 2, alignItems: "center", flex: 1 }} direction="row">
      {icon}
      <Typography>{primary}</Typography>
      {!xs && <Typography color="text.secondary">{secondary}</Typography>}
    </Stack>
  );
}
