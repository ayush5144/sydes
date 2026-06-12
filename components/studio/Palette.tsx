"use client";

import type { NodeKind } from "../../lib/factory";

const ITEMS: { kind: NodeKind; name: string; hint: string; glyph: string }[] = [
  { kind: "box", name: "box", hint: "a component", glyph: "▭" },
  { kind: "note", name: "note", hint: "freeform text", glyph: "✎" },
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
      <div className="sy-palette-tip">
        drag in · <kbd>tab</kbd> extends · drag down to delete
      </div>
    </aside>
  );
}
