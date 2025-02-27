import { Analysis } from "components/analysis/Analysis";
import { DataInspectorLayout } from "layout/DataInspectorLayout";
import Layout from "layout/Layout";
import { IndexHeader } from "./IndexHeader";
import Table from "./Table";
import { analysisTemplate } from "./analysisTemplate";
import { memoize } from "lodash";

const render = memoize((showHeader: boolean) => ({ header, children }) => (
  <>
    {showHeader ? <IndexHeader in={showHeader} /> : header}
    {children}
  </>
));

export default function Page({ showHeader }: { showHeader?: boolean }) {
  return (
    <Layout
      flat
      title={showHeader ? "Home" : "Benchmarks"}
      path={showHeader ? [] : [{ name: "Home", url: "/" }]}
      render={render(showHeader)}
    >
      <DataInspectorLayout
        data={<Table />}
        analysis={<Analysis template={analysisTemplate} />}
      />
    </Layout>
  );
}
