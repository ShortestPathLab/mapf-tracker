import dagre from "@dagrejs/dagre";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Edge, Node, Position } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { APIConfig } from "core/config";
import { capitalize, flatMap, map, pick, startCase } from "lodash";
import { json } from "queries/query";
import { get } from "./mutation";
import { queryClient } from "App";
import { useMemo } from "react";

const REFETCH_MS = 1000;

function layout<T extends Node>(nodes: Partial<T>[], edges: Edge[]) {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));

  graph.setGraph({ rankdir: "LR" });
  nodes.forEach((node) => graph.setNode(node.id, { width: 500, height: 100 }));
  edges.forEach((edge) => graph.setEdge(edge.source, edge.target));
  dagre.layout(graph);
  return graph as dagre.graphlib.Graph<T>;
}
type StatusType = "invalidated" | "done" | "running" | "error" | "pending";

type Status = {
  type: StatusType;
  stage: string;
  variables: any;
  timestamp: number;
};
type PipelineStatusResult = {
  destructive?: boolean;
  key: string;
  dependents: string[];
  status: Status;
  description?: string;
};

export const usePipelineStatus = () =>
  useQuery({
    queryKey: ["pipeline"],

    refetchInterval: REFETCH_MS,
    queryFn: async () =>
      json<PipelineStatusResult[]>(`${APIConfig.apiUrl}/pipeline/status`),
  });

export const usePipelineRunMutation = (stage: string) =>
  useMutation({
    mutationKey: ["pipelineRun"],
    mutationFn: async (action: "run" | "runOne" = "run") =>
      get<{ message: string }>(
        `${APIConfig.apiUrl}/pipeline/${action}/${stage}`
      ),
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
