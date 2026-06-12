"use client";

import type { NodeKind } from "../../lib/factory";

const ITEMS: { kind: NodeKind; name: string; hint: string; glyph: string }[] = [
  { kind: "note", name: "note", hint: "a card for jotting", glyph: "✎" },
  { kind: "text", name: "text", hint: "plain text, no card", glyph: "¶" },
  { kind: "box", name: "box", hint: "a component", glyph: "▭" },
  { kind: "table", name: "table", hint: "rows & columns", glyph: "▦" },
  { kind: "layer", name: "layer", hint: "group things", glyph: "▢" },
];

export function Palette({ onAdd }: { onAdd: (kind: NodeKind) => void }) {
  return (
    <aside className="sy-palette">
      {ITEMS.map((it) => (
        <button
          key={it.kind}
          className="sy-palette-item"
          title={`${it.name} — ${it.hint} (drag or click)`}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("application/sydes", it.kind);
            e.dataTransfer.effectAllowed = "move";
          }}
          onClick={() => onAdd(it.kind)}
        >
          <span className="sy-glyph">{it.glyph}</span>
          <span>{it.name}</span>
        </button>
      ))}
      <div className="sy-palette-tip">drag onto the canvas</div>
    </aside>
  );
}
