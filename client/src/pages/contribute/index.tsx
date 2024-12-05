import { Divider, Stack } from "@mui/material";
import { useSm } from "components/dialog/useSmallDisplay";
import { Layout } from "layout";
import { Info } from "./Info";
import { SubmitRequestForm } from "./SubmitRequestForm";
import TrackSubmissionHero from "./TrackSubmissionHero";

export default function Page() {
  const sm = useSm();
  return (
    <Layout
      flat
      title="Submit an algorithm"
      path={[{ name: "Submit", url: "/submit" }]}
    >
      <Stack direction="row">
        <SubmitRequestForm />
        <Divider flexItem />
        <TrackSubmissionHero />
      </Stack>
    </Layout>
  );
}
