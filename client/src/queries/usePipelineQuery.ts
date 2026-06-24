import dagre from "@dagrejs/dagre";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Edge, Node, Position } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { queryClient } from "App";
import { flatMap, map, pick } from "lodash";
import api, { untyped } from "hooks/useQuery";
import { useMemo } from "react";

const REFETCH_MS = 1000;

const runRoutes = {
  run: api.api.pipeline.run,
  runOne: api.api.pipeline.runOne,
} as const;

type StatusType = "invalidated" | "done" | "running" | "error" | "pending";

type Status = {
  type: StatusType;
  stage: string;
  variables: object;
  timestamp: number;
  error?: string;
};
type PipelineStatusResult = {
  destructive?: boolean;
  key: string;
  dependents: string[];
  status: Status;
  description?: string;
};

function layout<T extends Node>(nodes: Partial<T>[], edges: Edge[]) {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));

  graph.setGraph({ rankdir: "LR" });
  // Callers always provide `id` (e.g. `{ id: p.key, ... }`)
  nodes.forEach((node) =>
    graph.setNode(node.id!, { width: 500, height: 100 })
  );
  edges.forEach((edge) => graph.setEdge(edge.source, edge.target));
  dagre.layout(graph);
  return graph as dagre.graphlib.Graph<T>;
}
export const usePipelineStatus = () =>
  useQuery({
    queryKey: ["pipeline"],

    refetchInterval: REFETCH_MS,
    queryFn: () =>
      untyped<PipelineStatusResult[]>(api.api.pipeline.status.get()),
  });

export const usePipelineRunMutation = (stage: string) =>
  useMutation({
    mutationKey: ["pipelineRun"],
    mutationFn: (action: "run" | "runOne" = "run") =>
      untyped<{ message: string }>(runRoutes[action]({ stage }).get()),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["pipeline"] }),
  });

export const usePipelineViewerData = () => {
  const { data: result, isLoading } = usePipelineStatus();

  return useMemo(() => {
    {
      const nodes = map(result, (p) => ({
        id: p.key,
        data: {
          stage: p.key,
        },
      }));
      const edges = flatMap(result, (p) =>
        map(p.dependents, (d) => ({
          id: `${d}-${p.key}`,
          data: { label: d },
          source: p.key,
          target: d,
        }))
      );

      const graph = layout(nodes, edges);

      return {
        data: {
          nodes: map(
            nodes,
            (n) =>
              ({
                ...n,
                type: "pipeline-stage",
                position: pick(graph.node(n.id), "x", "y"),
                sourcePosition: Position.Right,
                targetPosition: Position.Left,
              } as Node<PipelineStageNodeData>)
          ),
          edges,
        },
        isLoading,
      };
    }
  }, [result, isLoading]);
};

export type PipelineStageNodeData = {
  stage: string;
};
