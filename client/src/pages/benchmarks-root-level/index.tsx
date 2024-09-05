import { Analysis } from "components/analysis/Analysis";
import Layout from "layout/Layout";
import { DataInspectorLayout } from "layout/DataInspectorLayout";
import { IndexHeader } from "./IndexHeader";
import Table from "./Table";
import { analysisTemplate } from "./analysisTemplate";
import { Box } from "@mui/material";
import { useSm } from "components/dialog/useSmallDisplay";

export default function Page({ showHeader }: { showHeader?: boolean }) {
  const sm = useSm();
  return (
    <Layout
      title={showHeader ? "Home" : "Benchmarks"}
      description="View all benchmarks and their results"
      slotProps={sm && { content: { sx: { bgcolor: "background.paper" } } }}
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
