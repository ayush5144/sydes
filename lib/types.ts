import type { Node, Edge } from "@xyflow/react";

export type BoxData = { title: string; lines: string };
export type NoteData = { text: string };
export type TableData = { title: string; rows: string[][]; note?: string; collapsed?: boolean };
export type LayerData = { title: string };

export type Direction = "v" | "h";

export type FileKind = "md" | "canvas";

/** One sydes file. kind "md" uses content; kind "canvas" uses nodes/edges. */
export type SydesFile = {
  id: string;
  name: string;
  kind: FileKind;
  updatedAt: number;
  content?: string;
  direction?: Direction;
  nodes?: Node[];
  edges?: Edge[];
};

/** Legacy alias — canvas files predate the md-first pivot. */
export type DiagramDoc = SydesFile;

export type DiagramMeta = { id: string; name: string; kind?: FileKind; updatedAt: number };
