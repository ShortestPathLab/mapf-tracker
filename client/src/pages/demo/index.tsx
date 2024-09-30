import { Layout, Prose } from "layout";
import { paper } from "theme";
import Content from "./content.mdx";

export default function Page() {
  return (
    <Layout
      flat
      width={720}
      title="System demo"
      path={[{ name: "Home", url: "/" }]}
    >
      <Prose
        sx={{
          "& h3": { mt: 0 },
          "& h3:not(:first-child)": { mt: 6 },
          "& pre": { whiteSpace: "pre-wrap", p: 2, ...paper() },
        }}
      >
        <Content />
      </Prose>
    </Layout>
  );
}
