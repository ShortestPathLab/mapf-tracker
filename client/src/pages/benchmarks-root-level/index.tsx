import { Analysis } from "components/analysis/Analysis";
import Layout, { DataInspectorLayout } from "layout/Layout";
import { IndexHeader } from "./IndexHeader";
import Table from "./Table";
import { analysisTemplate } from "./analysisTemplate";

export default function Page({ showHeader }: { showHeader?: boolean }) {
  return (
    <Layout
      title="Benchmarks"
      path={[{ name: "Home", url: "/" }]}
      render={({ header, children }) => (
        <>
          <IndexHeader in={showHeader} />
          {header}
          {children}
        </>
      )}
    >
      <DataInspectorLayout
        data={<Table />}
        analysis={<Analysis template={analysisTemplate} />}
      />
    </Layout>
  );
}
