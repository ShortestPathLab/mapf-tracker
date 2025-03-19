import { CircularProgress, Stack, useTheme } from "@mui/material";
import { Background, Controls, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useSm } from "components/dialog/useSmallDisplay";
import { Layout } from "layout";
import { RenderFixed } from "layout/renderFixed";
import { topbarHeight } from "layout/topbarHeight";
import { usePipelineViewerData } from "queries/usePipelineQuery";
import { CSSProperties } from "react";
import { PipelineStageNode } from "./PipelineStageNode";

export default function index() {
  const sm = useSm();
  const { palette, typography } = useTheme();
  const { data: { nodes, edges } = {}, isLoading } = usePipelineViewerData();
  return (
    <Layout
      collapse={false}
      flat
      title="Actions"
      path={[
        { name: "More", url: "/more" },
        { name: "Manage", url: "/dashboard" },
      ]}
      render={RenderFixed}
    >
      <Stack
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: `calc(100dvh - ${topbarHeight(sm)}px)`,
        }}
      >
        {isLoading ? (
          <Stack
            sx={{
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              width: "100%",
            }}
          >
            <CircularProgress />
          </Stack>
        ) : (
          <ReactFlow
            proOptions={{ hideAttribution: true }}
            style={
              {
                fontFamily: typography.fontFamily,
                "--xy-background-color-default": palette.background.paper,
              } as CSSProperties
            }
            colorMode={palette.mode}
            nodes={nodes}
            edges={edges}
            nodesDraggable={false}
            nodesConnectable={false}
            nodesFocusable={false}
            nodeTypes={{ "pipeline-stage": PipelineStageNode }}
          >
            <Background />
            <Controls />
          </ReactFlow>
        )}
      </Stack>
    </Layout>
  );
}
