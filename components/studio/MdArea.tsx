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
  focusOnMount = false,
  slash = true,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  minRows?: number;
  autoFocusIfEmpty?: boolean;
  focusOnMount?: boolean;
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

  // a freshly created empty node should be ready to type into;
  // focusOnMount also restores the caret when switching view → edit
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (focusOnMount) {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    } else if (autoFocusIfEmpty && !value) {
      el.focus();
    }
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

  const setCaret = (at: number) => {
    requestAnimationFrame(() => {
      const el = ref.current;
      if (el) {
        el.focus();
        el.setSelectionRange(at, at);
      }
    });
  };

  const apply = (item: SlashItem) => {
    if (!menu) return;
    const next = value.slice(0, menu.lineStart) + item.insert + value.slice(menu.pos);
    onChange(next);
    setMenu(null);
    setCaret(menu.lineStart + (item.caret ?? item.insert.length));
  };

  // Enter inside a list/todo/quote continues it; Enter on an empty item ends it
  const continueBlock = (e: React.KeyboardEvent<HTMLTextAreaElement>): boolean => {
    const el = ref.current;
    if (!el || el.selectionStart !== el.selectionEnd) return false;
    const pos = el.selectionStart;
    const lineStart = value.lastIndexOf("\n", pos - 1) + 1;
    const line = value.slice(lineStart, pos);
    const m = line.match(/^(\s*)([-*] \[[ xX]\] |[-*] |> |(\d+)\. )/);
    if (!m) return false;
    e.preventDefault();
    const content = line.slice(m[0].length);
    if (!content.trim()) {
      // empty item → drop the marker, exit the list
      onChange(value.slice(0, lineStart) + value.slice(pos));
      setCaret(lineStart);
      return true;
    }
    let prefix = m[1] + m[2];
    if (m[3]) prefix = `${m[1]}${parseInt(m[3], 10) + 1}. `;
    prefix = prefix.replace(/\[[xX]\]/, "[ ]"); // next todo starts unchecked
    onChange(value.slice(0, pos) + "\n" + prefix + value.slice(pos));
    setCaret(pos + 1 + prefix.length);
    return true;
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
          if (menu && matches.length) {
            if (e.key === "Enter") {
              e.preventDefault();
              apply(matches[0]);
              return;
            }
            if (e.key === "Escape") {
              setMenu(null);
              return;
            }
          }
          if (e.key === "Enter" && !e.shiftKey) continueBlock(e);
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
