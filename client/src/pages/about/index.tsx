import { useXs } from "components/dialog/useSmallDisplay";
import { Layout } from "layout";
import { About } from "pages/docs/about";

export default function Page() {
  const xs = useXs();
  return (
    <Layout
      title="About"
      path={
        xs
          ? [
              { name: "Home", url: "/" },
              { name: "More", url: "/more" },
            ]
          : [{ name: "Home", url: "/" }]
      }
    >
      <About />
    </Layout>
  );
}
