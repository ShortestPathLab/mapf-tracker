import { Stack } from "@mui/material";
import { useSm } from "components/dialog/useSmallDisplay";
import { Layout } from "layout";
import { Info } from "./Info";
import { SubmitRequestForm } from "./SubmitRequestForm";
import TrackSubmissionHero from "./TrackSubmissionHero";

export default function Page() {
  const sm = useSm();
  return (
    <Layout
      title="Submit an algorithm"
      width="none"
      path={[{ name: "Home", url: "/" }]}
    >
      <Stack
        sx={{
          flexDirection: { md: "column", lg: "row" },
          alignItems: { md: "stretch", lg: "flex-start" },
          gap: sm ? 2 : 3,
        }}
      >
        <Info />
        <Stack sx={{ gap: sm ? 2 : 3, flex: 1 }}>
          <TrackSubmissionHero />
          <SubmitRequestForm />
        </Stack>
      </Stack>
    </Layout>
  );
}
