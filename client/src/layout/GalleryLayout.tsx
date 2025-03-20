import { Stack } from "@mui/material";
import { Item } from "components/Item";
import { useLg } from "components/dialog/useSmallDisplay";
import { isNumber, isUndefined } from "lodash";
import { ReactNode } from "react";
import Layout, { LayoutProps, LayoutRenderProps } from "./Layout";
import { ActionSheetProps } from "components/ActionSheet";
import { ActionBar } from "components/ActionBar";
import { InfoRounded } from "@mui-symbols-material/w400";
import { useSurface } from "components/surface";

const RenderSm = ({
  header,
  children,
  actions,
  cover,
  items,
}: LayoutRenderProps & GalleryLayoutProps) => {
  const { dialog, open } = useSurface(Sidebar, {
    title: "Info",
  });
  return (
    <Stack sx={{ gap: 4 }}>
      {header}
      <ActionBar
        {...actions}
        options={[
          ...(actions?.options ?? []),
          {
            icon: <InfoRounded />,
            label: "Get info",
            action: () => open({ cover, header, items, sidebarWidth: "100%" }),
          },
        ]}
      />
      {children}
      {dialog}
    </Stack>
  );
};

function Sidebar({
  cover,
  header,
  items,
  sidebarWidth,
}: GalleryLayoutProps & LayoutRenderProps) {
  return (
    <Stack
      sx={{
        overflowX: "hidden",
        wordWrap: "break-word",
        width: sidebarWidth,
        minWidth: sidebarWidth,
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
  sidebarWidth = 280,
  actions,
}: LayoutRenderProps & GalleryLayoutProps) => (
  <Stack direction="row" sx={{ gap: 8 }}>
    <Sidebar
      cover={cover}
      header={header}
      items={items}
      sidebarWidth={sidebarWidth}
    />
    <Stack sx={{ gap: 4, flex: 1, minWidth: 0 }}>
      {!!actions?.options?.length && <ActionBar {...actions} />}
      {children}
    </Stack>
  </Stack>
);

type GalleryLayoutProps = {
  cover?: ReactNode;
  items?: {
    value?: ReactNode;
    label?: ReactNode;
  }[];
  sidebarWidth?: string | number;
  actions?: ActionSheetProps;
};

export function GalleryLayout(props: LayoutProps & GalleryLayoutProps) {
  const sm = useLg();
  return <Layout {...props} flat render={sm ? RenderSm : RenderLg} />;
}
