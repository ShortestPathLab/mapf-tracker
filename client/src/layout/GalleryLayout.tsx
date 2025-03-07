import { Box, Stack } from "@mui/material";
import { Item } from "components/Item";
import { useSm } from "components/dialog/useSmallDisplay";
import { isNumber, isUndefined } from "lodash";
import { ReactNode } from "react";
import { useMeasure } from "react-use";
import Layout, { LayoutProps, LayoutRenderProps } from "./Layout";

const RenderSm = ({
  header,
  children,
}: LayoutRenderProps & GalleryLayoutProps) => (
  <Stack sx={{ gap: 4 }}>
    {header}
    {children}
  </Stack>
);

const RenderLg = ({
  header,
  children,
  cover,
  items,
  sidebarWidth = 320,
}: LayoutRenderProps & GalleryLayoutProps) => (
  <Stack direction="row" sx={{ gap: 8 }}>
    <Stack
      sx={{
        width: sidebarWidth,
        minWidth: 320,
        gap: 4,
        position: "sticky",
        height: "max-content",
        top: (t) => t.spacing(3),
      }}
    >
      <Stack
        sx={{
          width: "60%",
          "> *": { width: "100%" },
        }}
      >
        {cover}
      </Stack>
      {header}
      <Stack>
        {items?.map?.(({ label, value }, i) => (
          <Item
            invert
            key={i}
            primary={
              !isUndefined(value)
                ? isNumber(value)
                  ? value.toLocaleString()
                  : value
                : "--"
            }
            secondary={label}
          />
        ))}
      </Stack>
    </Stack>
    <Stack sx={{ gap: 4, flex: 1, minWidth: 0 }}>{children}</Stack>
  </Stack>
);

type GalleryLayoutProps = {
  cover?: ReactNode;
  items?: {
    value?: ReactNode;
    label?: ReactNode;
  }[];
  sidebarWidth?: number;
};

const minWidth = 1200;

export function GalleryLayout(props: LayoutProps & GalleryLayoutProps) {
  const [ref, { width }] = useMeasure();
  const sm = useSm() || width < minWidth;
  return (
    <Box ref={ref} sx={{ width: "100%", height: "100%" }}>
      <Layout {...props} flat render={sm ? RenderSm : RenderLg} />
    </Box>
  );
}
