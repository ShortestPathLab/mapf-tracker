import { Stack } from "@mui/material";
import { Item } from "components/Item";
import { useLg } from "components/dialog/useSmallDisplay";
import { isNumber, isUndefined } from "lodash";
import { ReactNode } from "react";
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

function Sidebar({
  cover,
  header,
  items,
  sidebarWidth,
}: GalleryLayoutProps & LayoutRenderProps) {
  return (
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
      {!!cover && (
        <Stack
          sx={{
            width: "60%",
            "> *": { width: "100%" },
          }}
        >
          {cover}
        </Stack>
      )}
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
  );
}

const RenderLg = ({
  header,
  children,
  cover,
  items,
  sidebarWidth = 320,
}: LayoutRenderProps & GalleryLayoutProps) => (
  <Stack direction="row" sx={{ gap: 8 }}>
    <Sidebar
      cover={cover}
      header={header}
      items={items}
      sidebarWidth={sidebarWidth}
    />
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

export function GalleryLayout(props: LayoutProps & GalleryLayoutProps) {
  const sm = useLg();
  return <Layout {...props} flat render={sm ? RenderSm : RenderLg} />;
}
