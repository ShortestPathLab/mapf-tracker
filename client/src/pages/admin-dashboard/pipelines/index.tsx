import dagre from "@dagrejs/dagre";
import {
  CheckCircleOutlined,
  HighlightOffOutlined,
  PendingOutlined,
  RemoveCircleOutlined,
  RemoveCircleOutlineOutlined,
} from "@mui/icons-material";
import {
  Button,
  Card,
  CardActionArea,
  CircularProgress,
  ListItem,
  ListItemIcon,
  ListItemProps,
  ListItemText,
  Stack,
  useTheme,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import {
  Background,
  Controls,
  Edge,
  Handle,
  Node,
  Position,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useSnackbar } from "components/Snackbar";
import { APIConfig } from "core/config";
import { format } from "date-fns";
import { DialogContentProps, useDialog } from "hooks/useDialog";
import { Layout } from "layout";
import { capitalize, flatMap, map, pick, startCase } from "lodash";
import GenericDetailsList from "pages/submission-summary/GenericDetailsList";
import { json } from "queries/query";
import {
  PipelineStageNodeData,
  usePipelineRunMutation,
  usePipelineViewerData,
} from "queries/usePipelineQuery";
import { CSSProperties } from "react";
import AutoSize from "react-virtualized-auto-sizer";
import { paper } from "theme";

export function StageStatusDialog({
  onClose,
  data,
}: DialogContentProps & { data?: PipelineStageNodeData }) {
  const { mutateAsync, isPending } = usePipelineRunMutation(data.key);
  const notify = useSnackbar();
  return (
    <Stack sx={{ gap: 4 }}>
      <StageStatus data={data} sx={{ ml: -2 }} />
      <Button
        variant="contained"
        disabled={isPending}
        onClick={async () => {
          notify("Scheduling run");
          await mutateAsync();
          notify("Scheduled run");
          onClose?.();
        }}
      >
        Run now
      </Button>
      <GenericDetailsList data={data.original} sx={{ m: -2 }} />
    </Stack>
  );
}
function StageStatus({
  data: { label, status = "invalidated", lastRun },
  ...props
}: { data: PipelineStageNodeData } & ListItemProps) {
  return (
    <ListItem {...props}>
      <ListItemIcon sx={{ mr: -2 }}>
        {
          {
            error: <HighlightOffOutlined color="error" />,
            running: <PendingOutlined color="warning" />,
            invalidated: <RemoveCircleOutlineOutlined color="disabled" />,
            done: <CheckCircleOutlined color="success" />,
          }[status]
        }
      </ListItemIcon>
      <ListItemText
        primary={label}
        secondary={
          lastRun
            ? `Last run: ${format(lastRun, "yyyy-MM-dd HH:mm:ss")}`
            : "Never run"
        }
      />
    </ListItem>
  );
}
function PipelineStageNode({ data }: { data: PipelineStageNodeData }) {
  const { dialog, open } = useDialog(StageStatusDialog, {
    title: "Stage details",
    padded: true,
  });
  return (
    <>
      <Card
        sx={{
          bgcolor: "background.default",
          border: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <CardActionArea onClick={() => open({ data })}>
          <Handle type="target" position={Position.Left} />
          <StageStatus data={data} />
          <Handle type="source" position={Position.Right} />
        </CardActionArea>
      </Card>
      {dialog}
    </>
  );
}

export default function index() {
  const { palette, typography } = useTheme();
  const { data: { nodes, edges } = {}, isLoading } = usePipelineViewerData();
  return (
    <Layout
      width="100%"
      title="Pipelines"
      path={[
        { name: "Home", url: "/" },
        { name: "Dashboard", url: "/dashboard" },
      ]}
    >
      <AutoSize>
        {({ width }) => (
          <Card sx={{ width, height: "70vh" }}>
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
                style={
                  {
                    fontFamily: typography.fontFamily,
                    "--xy-background-color-default": palette.background.paper,
                    "--xy-node-background-color": palette.background.default,
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
          </Card>
        )}
      </AutoSize>
    </Layout>
  );
}
