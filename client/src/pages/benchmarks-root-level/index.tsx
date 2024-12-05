import { Analysis } from "components/analysis/Analysis";
import { DataInspectorLayout } from "layout/DataInspectorLayout";
import Layout from "layout/Layout";
import { IndexHeader } from "./IndexHeader";
import Table from "./Table";
import { analysisTemplate } from "./analysisTemplate";

export default function Page({ showHeader }: { showHeader?: boolean }) {
  return (
    <Layout
      flat
      title={showHeader ? "Home" : "Benchmarks"}
      description="View all benchmarks and their results"
      path={showHeader ? [] : [{ name: "Home", url: "/" }]}
      render={({ header, children }) => (
        <>
          {showHeader ? <IndexHeader in={showHeader} /> : header}
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
