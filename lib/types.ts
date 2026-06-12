import type { Node, Edge } from "@xyflow/react";

export type BoxData = { title: string; lines: string };
export type NoteData = { text: string };
export type TableData = { title: string; rows: string[][]; note?: string };
export type LayerData = { title: string };

export type Direction = "v" | "h";

export type DiagramDoc = {
  id: string;
  name: string;
  direction: Direction;
  nodes: Node[];
  edges: Edge[];
  updatedAt: number;
};

export type DiagramMeta = { id: string; name: string; updatedAt: number };
