import { Card } from "@mui/material";
import Layout, { DataInspectorLayout } from "layout/Layout";
import Table from "./Table";
import { IndexHeader } from "./IndexHeader";
import { Analysis } from "components/analysis/Analysis";
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
        data={
          <Card>
            <Table />
          </Card>
        }
        analysis={
          <Card>
            <Analysis template={analysisTemplate} />
          </Card>
        }
      />
    </Layout>
  );
}
