import { Button, Stack, Tooltip, Typography } from "@mui/material";
import { useXs } from "components/dialog/useSmallDisplay";
import Motivations from "docs/motivations.md";
import { useNavigate } from "hooks/useNavigation";
import { Grid, Layout, Prose } from "layout";
import { RenderChildrenOnly } from "layout/Layout";
import { filter } from "lodash";
import { ArticleCard } from "pages/docs/ArticleCard";
import { pages } from "pages/docs/pages";
import { SectionContent } from "pages/make-a-submission/Section";

export default function Page() {
  const xs = useXs();
  const navigate = useNavigate();
  return (
    <Layout
      disablePadding
      title="Call for submissions"
      render={RenderChildrenOnly}
      path={
        xs
          ? [
              { name: "Home", url: "/" },
              { name: "More", url: "/more" },
            ]
          : [{ name: "Home", url: "/" }]
      }
    >
      <SectionContent>
        <Stack sx={{ gap: 4 }}>
          <Typography variant="h2">Call for submissions</Typography>
          <Prose>
            <Motivations />
          </Prose>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/submit")}
            sx={xs ? {} : { maxWidth: "fit-content" }}
          >
            Make a submission now
          </Button>
          <Stack sx={{ gap: 2 }}>
            <Typography variant="overline" color="text.secondary">
              Read the docs
            </Typography>
            <Grid width={280} gap={2}>
              {filter(pages(), (p) =>
                ["problem-definition", "how-to-submit"].includes(p.value)
              ).map((page) => (
                <Tooltip
                  key={page?.value}
                  title="Open this article in a new tab"
                >
                  <ArticleCard
                    page={page}
                    onClick={() => open(`/docs/${page.value}`, "_blank")}
                  />
                </Tooltip>
              ))}
            </Grid>
          </Stack>
        </Stack>
      </SectionContent>
    </Layout>
  );
}
