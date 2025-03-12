import { Layout } from "layout";
import Statistics from "./Statistics";

export default function index() {
  return (
    <Layout
      flat
      title="Statistics"
      path={[
        { name: "More", url: "/more" },
        { name: "Dashboard", url: "/dashboard" },
      ]}
    >
      <Statistics />
    </Layout>
  );
}
