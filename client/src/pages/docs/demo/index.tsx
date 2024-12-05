import { Prose } from "layout";
import { paper } from "theme";
import { ArticleLayout } from "../../../layout/ArticleLayout";
import Content from "./content.mdx";

export default function Page() {
  return (
    <ArticleLayout
      title="System demo"
      subtitle="Watch our system in action"
      path={[
        { name: "Home", url: "/" },
        { name: "Docs", url: "/docs" },
      ]}
    >
      <Prose
        sx={{
          "& h3": { mt: 0 },
          "& h3:not(:first-child)": { mt: 6 },
          "& pre": {
            whiteSpace: "pre-wrap",
            p: 2,
            ...paper(0),
            overflow: "hidden",
          },
        }}
      >
        <Content />
      </Prose>
    </ArticleLayout>
  );
}
