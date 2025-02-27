import { Stack } from "@mui/material";
import { Item } from "components/Item";
import { useSm } from "components/dialog/useSmallDisplay";
import { ReactNode } from "react";
import Layout, { LayoutProps } from "./Layout";

export function GalleryLayout({
  cover,
  items,
  ...props
}: LayoutProps & {
  cover?: ReactNode;
  items?: { value?: ReactNode; label?: ReactNode }[];
}) {
  const sm = useSm();
  return (
    <Layout
      {...props}
      flat
      render={
        sm
          ? undefined
          : ({ header, children }) => (
              <Stack direction="row" sx={{ gap: 8 }}>
                <Stack
                  sx={{
                    width: 320,
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
                      borderRadius: 1,
                      overflow: "hidden",
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
                        primary={value ?? "--"}
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
