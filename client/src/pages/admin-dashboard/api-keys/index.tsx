import { Layout } from "layout";

export default function index() {
  return (
    <Layout
      flat
      width={960}
      title="API keys"
      path={[
        { name: "Home", url: "/" },
        { name: "Dashboard", url: "/dashboard" },
      ]}
    >
      Todo
    </Layout>
  );
}
