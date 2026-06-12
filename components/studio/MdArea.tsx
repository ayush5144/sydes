"use client";

import { useRef, useState } from "react";

type SlashItem = { key: string; name: string; insert: string; caret?: number };

const ITEMS: SlashItem[] = [
  { key: "h2", name: "heading", insert: "## " },
  { key: "h3", name: "subheading", insert: "### " },
  { key: "bullet", name: "bullet list", insert: "- " },
  { key: "todo", name: "todo", insert: "- [ ] " },
  { key: "code", name: "code block", insert: "```\n\n```", caret: 4 },
  { key: "quote", name: "quote", insert: "> " },
  { key: "divider", name: "divider", insert: "---\n" },
  { key: "table", name: "table", insert: "| col | col |\n| --- | --- |\n|  |  |\n" },
];

/**
 * A markdown textarea with notion-style slash commands: type "/" at the
 * start of a line to insert a block. Used by notes and table notes so the
 * editing experience is identical everywhere.
 */
export function MdArea({
  value,
  onChange,
  placeholder,
  className,
  minRows = 2,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  minRows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [slash, setSlash] = useState<{ query: string; lineStart: number; pos: number } | null>(
    null
  );

  const matches = slash
    ? ITEMS.filter(
        (i) => i.key.startsWith(slash.query) || i.name.includes(slash.query)
      )
    : [];

  const detect = (v: string) => {
    const el = ref.current;
    if (!el) return setSlash(null);
    const pos = el.selectionStart;
    const lineStart = v.lastIndexOf("\n", pos - 1) + 1;
    const line = v.slice(lineStart, pos);
    if (line.startsWith("/") && !line.includes(" ")) {
      setSlash({ query: line.slice(1).toLowerCase(), lineStart, pos });
    } else {
      setSlash(null);
    }
  };

  const apply = (item: SlashItem) => {
    if (!slash) return;
    const next = value.slice(0, slash.lineStart) + item.insert + value.slice(slash.pos);
    onChange(next);
    setSlash(null);
    const caret = slash.lineStart + (item.caret ?? item.insert.length);
    requestAnimationFrame(() => {
      const el = ref.current;
      if (el) {
        el.focus();
        el.setSelectionRange(caret, caret);
      }
    });
  };

  return (
    <div className="sy-mdarea">
      <textarea
        ref={ref}
        className={`nodrag ${className ?? ""}`}
        value={value}
        placeholder={placeholder}
        spellCheck={false}
        rows={Math.max(minRows, value.split("\n").length)}
        onChange={(e) => {
          onChange(e.target.value);
          detect(e.target.value);
        }}
        onKeyDown={(e) => {
          if (!slash || !matches.length) return;
          if (e.key === "Enter") {
            e.preventDefault();
            apply(matches[0]);
          }
          if (e.key === "Escape") setSlash(null);
        }}
        onBlur={() => setTimeout(() => setSlash(null), 150)}
      />
      {slash && matches.length > 0 && (
        <div className="sy-slash nodrag">
          {matches.map((i, idx) => (
            <button key={i.key} onMouseDown={(e) => { e.preventDefault(); apply(i); }}>
              <span className="sy-slash-key">/{i.key}</span>
              {i.name}
              {idx === 0 && <kbd>↵</kbd>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
