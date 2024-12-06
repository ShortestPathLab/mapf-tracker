import { Router } from "components/Router";
import { useNavigate } from "hooks/useNavigation";
import { Grid, Layout } from "layout";
import { pages } from "./pages";
import { ArticleCard } from "./ArticleCard";

export default function index() {
  const navigate = useNavigate();
  return (
    <Router
      routes={[
        {
          path: "/docs/",
          parent: "/",
          content: (
            <Layout flat title="Docs" path={[{ name: "Home", url: "/" }]}>
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
