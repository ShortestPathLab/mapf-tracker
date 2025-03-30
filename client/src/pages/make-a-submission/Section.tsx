import { ArrowBackRounded } from "@mui-symbols-material/w400";
import { IconButton, Stack } from "@mui/material";
import { appbarHeight } from "components/appbar";
import { useMd, useSm, useXs } from "components/dialog/useSmallDisplay";
import { useNavigate } from "hooks/useNavigation";
import { bottomBarHeight } from "layout/navbarHeight";
import { ReactNode } from "react";

export function Section({ children, header }) {
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

export function SectionContent({ children }: { children?: ReactNode }) {
  const xs = useXs();
  const sm = useSm();
  const md = useMd();
  return (
    <Stack
      sx={{
        width: 960,
        maxWidth: "100%",
        mx: "auto",
        py: xs ? 2 : md ? 0 : 6,
        minHeight: `calc(100dvh - ${
          appbarHeight(sm) + 68 * 2 + bottomBarHeight(sm)
        }px)`,
      }}
    >
      <Stack sx={{ p: xs ? 2 : 3 }}>{children}</Stack>
    </Stack>
  );
}
