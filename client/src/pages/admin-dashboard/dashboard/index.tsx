import { Layout } from "layout";

export default function index() {
  return (
    <Layout
      width={960}
      title="Dashboard"
      path={[{ name: "MAPF Tracker", url: "/" }]}
    ></Layout>
  );
}
