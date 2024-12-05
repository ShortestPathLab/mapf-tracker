import { Prose } from "layout";
import { ArticleLayout } from "pages/docs/demo/ArticleLayout";
import { paper } from "theme";
import Content from "./content.mdx";

export default function Page() {
  return (
    <ArticleLayout
      title="Get the dataset"
      subtitle="Links to the dataset and information about the data format"
      path={[
        { name: "Home", url: "/" },
        { name: "Docs", url: "/docs" },
      ]}
    >
      <Prose
        sx={{
          "& h3:not(:first-child)": { mt: 6 },
          " hr": { mt: 6 },
          " table": { ...paper(), p: 2, width: "100%" },
        }}
      >
        <Content />
      </Prose>
    </ArticleLayout>
  );
}
