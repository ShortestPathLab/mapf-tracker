import { Stack, Tooltip, Typography } from "@mui/material";
import { useSm } from "components/dialog/useSmallDisplay";
import { Layout } from "layout";
import { SubmitRequestForm } from "./SubmitRequestForm";
import TrackSubmissionHero from "./TrackSubmissionHero";
import { ArticleCard } from "pages/docs/ArticleCard";
import { submissionInstructions } from "pages/docs/pages";

export default function Page() {
  const sm = useSm();
  const page = submissionInstructions();
  return (
    <Layout
      flat
      width={960}
      title="New API key"
      render={({ header, children }) => (
        <Stack sx={{ gap: 4, py: sm ? 0 : 4 }}>
          {header}
          {children}
        </Stack>
      )}
      path={[{ name: "Submit", url: "/submit" }]}
    >
      <Stack direction="row" sx={{ gap: 4 }}>
        <Stack sx={{ gap: 4 }}>
          <Typography variant="body1">
            Ready to submit your algorithm to our tracker? Fill out this form
            and our team will get back to you with your submission key.
          </Typography>
          <SubmitRequestForm />
        </Stack>
        {!sm && (
          <Stack sx={{ gap: 2, height: "100%", position: "sticky", top: 32 }}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ mt: -0.5 }}
            >
              Related pages
            </Typography>
            <Tooltip title="Open this article in a new tab">
              <ArticleCard
                page={page}
                onClick={() => open(`/docs/${page.value}`, "_blank")}
              />
            </Tooltip>

            <TrackSubmissionHero />
          </Stack>
        )}
      </Stack>
    </Layout>
  );
}
