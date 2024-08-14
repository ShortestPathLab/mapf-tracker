import { Analysis } from "components/analysis/Analysis";
import Layout, { DataInspectorLayout } from "layout/Layout";
import { IndexHeader } from "./IndexHeader";
import Table from "./Table";
import { analysisTemplate } from "./analysisTemplate";
import { Box } from "@mui/material";
import { useSm } from "components/dialog/useSmallDisplay";

export default function Page({ showHeader }: { showHeader?: boolean }) {
  const sm = useSm();
  return (
    <Layout
      title="Benchmarks"
      slotProps={sm && { content: { sx: { bgcolor: "background.paper" } } }}
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
