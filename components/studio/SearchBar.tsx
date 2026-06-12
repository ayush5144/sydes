"use client";

import type { Node } from "@xyflow/react";
import { useState } from "react";
import type { BoxData, LayerData, NoteData, TableData } from "../../lib/types";

function searchable(n: Node): string {
  if (n.type === "box") {
    const d = n.data as BoxData;
    return `${d.title}\n${d.lines}`;
  }
  if (n.type === "note" || n.type === "text") return (n.data as NoteData).text;
  if (n.type === "table") {
    const d = n.data as TableData;
    return `${d.title}\n${d.rows.flat().join(" ")}\n${d.note ?? ""}`;
  }
  if (n.type === "layer") return (n.data as LayerData).title;
  return "";
}

const GLYPH: Record<string, string> = {
  box: "▭",
  note: "✎",
  text: "¶",
  table: "▦",
  layer: "▢",
};

export function SearchBar({ nodes, onJump }: { nodes: Node[]; onJump: (id: string) => void }) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const matches = query
    ? nodes
        .map((n) => ({ n, text: searchable(n) }))
        .filter((m) => m.text.toLowerCase().includes(query))
        .slice(0, 8)
    : [];

  const snippet = (text: string) => {
    const at = text.toLowerCase().indexOf(query);
    const line = text.slice(Math.max(0, at - 20), at + 40).replace(/\n/g, " ").trim();
    return line || "(empty)";
  };

  return (
    <div className="sy-search">
      <input
        value={q}
        placeholder="search canvas…"
        spellCheck={false}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && matches.length) {
            onJump(matches[0].n.id);
            setQ("");
          }
          if (e.key === "Escape") setQ("");
        }}
      />
      {matches.length > 0 && (
        <div className="sy-search-results">
          {matches.map(({ n, text }) => (
            <button
              key={n.id}
              onClick={() => {
                onJump(n.id);
                setQ("");
              }}
            >
              <span className="sy-glyph">{GLYPH[n.type ?? ""] ?? "·"}</span>
              <span className="sy-search-snippet">{snippet(text)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
