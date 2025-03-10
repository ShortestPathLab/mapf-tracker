import { Router } from "components/Router";
import { useNavigate } from "hooks/useNavigation";
import { Grid, Layout } from "layout";
import { pages } from "./pages";
import { ArticleCard } from "./ArticleCard";
import { useXs } from "components/dialog/useSmallDisplay";

export default function index() {
  const navigate = useNavigate();
  const xs = useXs();
  return (
    <Router
      routes={[
        {
          path: xs ? "*" : "/docs/",
          parent: "/manage",
          content: (
            <Layout
              flat
              title="Docs"
              path={
                xs
                  ? [
                      { name: "Home", url: "/" },
                      { name: "More", url: "/manage" },
                    ]
                  : [{ name: "Home", url: "/" }]
              }
            >
              <Grid sx={{ gap: 2 }}>
                {pages().map((page) => (
                  <ArticleCard
                    key={page?.label}
                    page={page}
                    onClick={
                      page?.value
                        ? () => navigate(`/docs/${page?.value}`)
                        : undefined
                    }
                  />
                ))}
              </Grid>
            </Layout>
          ),
        },
        ...pages().map(({ content, value }) => ({
          content,
          path: `/docs/${value}`,
          parent: "/docs/",
        })),
      ]}
    />
  );
}
