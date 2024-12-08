import { Stack, Tooltip, Typography } from "@mui/material";
import { useSm } from "components/dialog/useSmallDisplay";
import { Layout } from "layout";
import { ArticleCard } from "pages/docs/ArticleCard";
import { submissionInstructions } from "pages/docs/pages";
import { SubmitRequestForm } from "./SubmitRequestForm";

export function RequestAnAPIKeyContent({ onClose }: { onClose?: () => void }) {
  const sm = useSm();
  const page = submissionInstructions();
  return (
    <Stack direction="row" sx={{ gap: 4 }}>
      <Stack sx={{ gap: 4, flex: 1 }}>
        <Typography variant="body1">
          Ready to submit your algorithm to our tracker? Fill out this form and
          our team will get back to you with your submission key.
        </Typography>
        <SubmitRequestForm onClose={onClose} />
      </Stack>
      {!sm && (
        <Stack
          sx={{
            gap: 2,
            height: "100%",
            position: "sticky",
            top: 72 + 32,
            width: 290,
          }}
        >
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ mt: -0.5 }}
          >
            Read the docs
          </Typography>
          <Tooltip title="Open this article in a new tab">
            <ArticleCard
              page={page}
              onClick={() => open(`/docs/${page.value}`, "_blank")}
            />
          </Tooltip>
        </Stack>
      )}
    </Stack>
  );
}

export default function Page() {
  const sm = useSm();
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
      <RequestAnAPIKeyContent />
    </Layout>
  );
}
