import { Layout } from "layout";
import Statistics from "./Statistics";

export default function index() {
  return (
    <Layout
      flat
      width="none"
      title="Statistics"
      path={[
        { name: "Home", url: "/" },
        { name: "Dashboard", url: "/dashboard" },
      ]}
    >
      <Statistics />
    </Layout>
  );
}
