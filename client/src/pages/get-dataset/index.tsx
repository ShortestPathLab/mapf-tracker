import { Layout, Prose } from "layout";
import Content from "./content.mdx";
import { paper } from "theme";

export default function Page() {
  return (
    <Layout
      width={960}
      title="Get the dataset"
      path={[{ name: "Home", url: "/" }]}
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
    </Layout>
  );
}
