import { Stack } from "@mui/material";
import { Item } from "components/Item";
import { useSm } from "components/dialog/useSmallDisplay";
import { ReactNode } from "react";
import Layout, { LayoutProps } from "./Layout";
import { isNumber, isUndefined } from "lodash";

export function GalleryLayout({
  cover,
  items,
  sidebarWidth = 320,
  ...props
}: LayoutProps & {
  cover?: ReactNode;
  items?: { value?: ReactNode; label?: ReactNode }[];
  sidebarWidth?: number;
}) {
  const sm = useSm();
  return (
    <Layout
      {...props}
      flat
      render={
        sm
          ? ({ header, children }) => (
              <Stack sx={{ gap: 4 }}>
                <Stack sx={{ width: 128, mb: -2 }}>{cover}</Stack>
                {header}
                {children}
              </Stack>
            )
          : ({ header, children }) => (
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
                <Stack sx={{ gap: 4, flex: 1 }}>{children}</Stack>
              </Stack>
            )
      }
    />
  );
}
