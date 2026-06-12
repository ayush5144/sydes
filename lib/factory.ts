import type { Edge, Node } from "@xyflow/react";
import type { DiagramDoc } from "./types";

export const uid = () => crypto.randomUUID().slice(0, 8);

export type NodeKind = "box" | "note" | "table" | "layer";

export function makeNode(kind: NodeKind, position: { x: number; y: number }): Node {
  const id = `${kind}-${uid()}`;
  switch (kind) {
    case "box":
      return { id, type: "box", position, data: { title: "", lines: "" } };
    case "note":
      return { id, type: "note", position, data: { text: "" } };
    case "table":
      return {
        id,
        type: "table",
        position,
        data: { title: "", rows: [["column", "column"], ["", ""]] },
      };
    case "layer":
      return {
        id,
        type: "layer",
        position,
        data: { title: "layer" },
        style: { width: 420, height: 280 },
        zIndex: -1,
      };
  }
}

export function starterDiagram(): DiagramDoc {
  const nodes: Node[] = [
    {
      id: "box-client",
      type: "box",
      position: { x: 240, y: 40 },
      data: { title: "WEB UI", lines: "canvas · palette · export" },
    },
    {
      id: "box-api",
      type: "box",
      position: { x: 240, y: 220 },
      data: { title: "API LAYER", lines: "auth · crud · enqueue" },
    },
    {
      id: "box-db",
      type: "box",
      position: { x: 120, y: 400 },
      data: { title: "POSTGRES", lines: "single source of truth" },
    },
    {
      id: "box-queue",
      type: "box",
      position: { x: 420, y: 400 },
      data: { title: "JOB QUEUE", lines: "background work" },
    },
    {
      id: "note-1",
      type: "note",
      position: { x: 620, y: 60 },
      data: {
        text: "double-click an arrow to label it.\ndrag components in from the left.\nexport ⌘ markdown when ready.",
      },
    },
  ];
  const edges: Edge[] = [
    { id: "e1", source: "box-client", target: "box-api", type: "wire", label: "HTTPS" },
    { id: "e2", source: "box-api", target: "box-db", type: "wire" },
    { id: "e3", source: "box-api", target: "box-queue", type: "wire", label: "enqueues" },
  ];
  return {
    id: `d-${uid()}`,
    name: "untitled system",
    direction: "v",
    nodes,
    edges,
    updatedAt: Date.now(),
  };
}

export function blankDiagram(name = "untitled system"): DiagramDoc {
  return {
    id: `d-${uid()}`,
    name,
    direction: "v",
    nodes: [makeNode("box", { x: 280, y: 160 })],
    edges: [],
    updatedAt: Date.now(),
  };
}
