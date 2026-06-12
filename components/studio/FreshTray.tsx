"use client";

import type { Edge, Node } from "@xyflow/react";
import type { BoxData, NoteData, TableData } from "../../lib/types";

const GLYPH: Record<string, string> = { box: "▭", note: "✎", text: "¶", table: "▦" };

function isFresh(n: Node): boolean {
  if (n.type === "box") {
    const d = n.data as BoxData;
    return !d.title.trim() && !d.lines.trim();
  }
  if (n.type === "note" || n.type === "text") return !(n.data as NoteData).text.trim();
  if (n.type === "table") {
    const d = n.data as TableData;
    return !d.title.trim() && d.rows.flat().every((c) => !c.trim()) && !(d.note ?? "").trim();
  }
  return false;
}

/**
 * Spawned-but-untouched components: empty content and no connections.
 * Click to jump to one; drag it onto the canvas to place it where you want.
 */
export function FreshTray({
  nodes,
  edges,
  onJump,
}: {
  nodes: Node[];
  edges: Edge[];
  onJump: (id: string) => void;
}) {
  const connected = new Set(edges.flatMap((e) => [e.source, e.target]));
  const fresh = nodes.filter((n) => !connected.has(n.id) && isFresh(n));
  if (!fresh.length) return null;

  return (
    <div className="sy-tray">
      <div className="sy-tray-title">fresh — not used yet</div>
      {fresh.map((n) => (
        <button
          key={n.id}
          className="sy-tray-item"
          title="click to jump · drag onto the canvas to place"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("application/sydes-move", n.id);
            e.dataTransfer.effectAllowed = "move";
          }}
          onClick={() => onJump(n.id)}
        >
          <span className="sy-glyph">{GLYPH[n.type ?? ""] ?? "·"}</span>
          <span>empty {n.type}</span>
        </button>
      ))}
    </div>
  );
}
