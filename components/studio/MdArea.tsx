"use client";

import { useEffect, useRef, useState } from "react";

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
 * A markdown textarea that auto-grows (never scrolls) with notion-style
 * slash commands: type "/" at the start of a line to insert a block.
 * One editing experience for notes, text sections, table notes, box lines.
 */
export function MdArea({
  value,
  onChange,
  placeholder,
  className,
  minRows = 2,
  autoFocusIfEmpty = false,
  slash = true,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  minRows?: number;
  autoFocusIfEmpty?: boolean;
  slash?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [menu, setMenu] = useState<{ query: string; lineStart: number; pos: number } | null>(
    null
  );

  // grow to fit content — content must never scroll inside a node
  useEffect(() => {
    const el = ref.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [value]);

  // a freshly created empty node should be ready to type into
  useEffect(() => {
    if (autoFocusIfEmpty && !value) ref.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const matches = menu
    ? ITEMS.filter((i) => i.key.startsWith(menu.query) || i.name.includes(menu.query))
    : [];

  const detect = (v: string) => {
    if (!slash) return;
    const el = ref.current;
    if (!el) return setMenu(null);
    const pos = el.selectionStart;
    const lineStart = v.lastIndexOf("\n", pos - 1) + 1;
    const line = v.slice(lineStart, pos);
    if (line.startsWith("/") && !line.includes(" ")) {
      setMenu({ query: line.slice(1).toLowerCase(), lineStart, pos });
    } else {
      setMenu(null);
    }
  };

  const apply = (item: SlashItem) => {
    if (!menu) return;
    const next = value.slice(0, menu.lineStart) + item.insert + value.slice(menu.pos);
    onChange(next);
    setMenu(null);
    const caret = menu.lineStart + (item.caret ?? item.insert.length);
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
        rows={minRows}
        onChange={(e) => {
          onChange(e.target.value);
          detect(e.target.value);
        }}
        onKeyDown={(e) => {
          if (!menu || !matches.length) return;
          if (e.key === "Enter") {
            e.preventDefault();
            apply(matches[0]);
          }
          if (e.key === "Escape") setMenu(null);
        }}
        onBlur={() => setTimeout(() => setMenu(null), 150)}
      />
      {menu && matches.length > 0 && (
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
