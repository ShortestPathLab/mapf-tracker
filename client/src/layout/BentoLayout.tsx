import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Divider, Stack, Tab, Typography } from "@mui/material";
import { Scroll } from "components/dialog/Scrollbars";
import { useMd } from "components/dialog/useSmallDisplay";
import { ReactNode, useState } from "react";
import Layout, { LayoutProps } from "./Layout";
import { TabBar } from "./TabBar";
import { topbarHeight } from "./topbarHeight";

export function BentoLayout({
  contentLeft,
  contentRight,
  labelLeft,
  labelRight,
  widthLeft = "min(460px, 40%)",
  ...props
}: LayoutProps & {
  labelLeft?: string;
  labelRight?: string;
  contentLeft?: ReactNode;
  widthLeft?: string | number;
  contentRight?: ReactNode;
}) {
  const sm = useMd();
  const [tab, setTab] = useState<"left" | "right">("left");

  return (
    <Layout flat {...props}>
      {sm ? (
        <TabContext value={tab}>
          <TabBar>
            <TabList onChange={(e, v) => setTab(v)}>
              {[
                { label: labelLeft, value: "left" },
                { label: labelRight, value: "right" },
              ].map(({ label, value }) => (
                <Tab
                  sx={{ minWidth: 0, px: 0, mx: sm ? 2 : 0, mr: sm ? 2 : 4 }}
                  key={value}
                  label={label}
                  value={value}
                />
              ))}
            </TabList>
          </TabBar>
          <TabPanel
            value="left"
            sx={{ display: "flex", gap: 4, flexDirection: "column", p: 0 }}
          >
            {contentLeft}
          </TabPanel>
          <TabPanel
            value="right"
            sx={{
              display: "flex",
              gap: 4,
              flexDirection: "column",
              p: 0,
              mt: -6,
            }}
          >
            {contentRight}
          </TabPanel>
        </TabContext>
      ) : (
        <Stack
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            height: `calc(100dvh - ${topbarHeight(false) + 8 + 1}px)`,
            right: 0,
          }}
        >
          <Stack
            direction="row"
            sx={{
              bgcolor: "background.paper",
              height: "100%",
            }}
          >
            <Scroll y style={{ flex: 0.3, minWidth: widthLeft }}>
              <Stack sx={{ gap: 4, p: 3, flex: 1 }}>
                <Typography variant="h2">{labelLeft}</Typography>
                {contentLeft}
              </Stack>
            </Scroll>
            <Divider flexItem orientation="vertical" />
            <Scroll y style={{ flex: 1 }}>
              <Stack sx={{ gap: 4, p: 3, flex: 1 }}>
                <Typography variant="h2">{labelRight}</Typography>
                {contentRight}
              </Stack>
            </Scroll>
          </Stack>
        </Stack>
      )}
    </Layout>
  );
}
