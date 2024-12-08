import { Prose } from "layout";
import { ArticleLayout } from "layout/ArticleLayout";
import { paper } from "theme";
import Content from "./content.mdx";

export default function Page() {
  return (
    <ArticleLayout
      title="Call for submissions"
      subtitle="Calling for all MAPF researchers to share your work with us"
      path={[
        { name: "Home", url: "/" },
        { name: "Docs", url: "/docs" },
      ]}
    >
      <Prose
        sx={{
          "& h3:not(:first-child)": { mt: 6 },
          " hr": { mt: 6 },
          " table": { ...paper(0.5), p: 2, width: "100%" },
        }}
      >
        <Content />
      </Prose>
    </ArticleLayout>
  );
}
