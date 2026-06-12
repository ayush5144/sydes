"use client";

import { useMemo, useState } from "react";
import { parseBlocks, serializeBlocks } from "../../lib/blocks";
import { MdView } from "../../lib/markdown";
import { MdArea } from "./MdArea";

/**
 * The pure-markdown document editor. The md string is the source of truth:
 * blocks render via MdView; click one to edit just that block raw; commit
 * re-parses the whole document (so blank lines split blocks, emptied blocks
 * vanish). Drag the ⋮⋮ handle to reorder blocks.
 */
export function DocEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (v: string) => void;
}) {
  const blocks = useMemo(() => parseBlocks(content), [content]);
  const [editing, setEditing] = useState<number | null>(blocks.length ? null : 0);
  const [draft, setDraft] = useState("");
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const startEdit = (i: number) => {
    setDraft(blocks[i] ?? "");
    setEditing(i);
  };

  const commit = () => {
    if (editing === null) return;
    const next = [...blocks];
    if (editing >= next.length) {
      if (draft.trim()) next.push(draft);
    } else if (!draft.trim()) {
      next.splice(editing, 1);
    } else {
      next[editing] = draft;
    }
    onChange(serializeBlocks(next));
    setEditing(null);
    setDraft("");
  };

  const move = (from: number, to: number) => {
    if (from === to || from + 1 === to) return;
    const next = [...blocks];
    const [b] = next.splice(from, 1);
    next.splice(from < to ? to - 1 : to, 0, b);
    onChange(serializeBlocks(next));
  };

  return (
    <div className="sy-page">
      {blocks.map((b, i) => (
        <div
          key={i}
          className={`sy-block ${overIdx === i ? "sy-block-over" : ""}`}
          onDragOver={(e) => {
            if (dragIdx === null) return;
            e.preventDefault();
            setOverIdx(i);
          }}
          onDragLeave={() => setOverIdx((v) => (v === i ? null : v))}
          onDrop={(e) => {
            e.preventDefault();
            if (dragIdx !== null) move(dragIdx, i);
            setDragIdx(null);
            setOverIdx(null);
          }}
        >
          <span
            className="sy-block-handle"
            title="drag to reorder"
            draggable
            onDragStart={() => setDragIdx(i)}
            onDragEnd={() => {
              setDragIdx(null);
              setOverIdx(null);
            }}
          >
            ⋮⋮
          </span>
          {editing === i ? (
            <div
              className="sy-block-editing"
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Element)) commit();
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") commit();
              }}
            >
              <MdArea
                className="sy-block-editor"
                value={draft}
                minRows={1}
                focusOnMount
                onChange={setDraft}
              />
            </div>
          ) : (
            <div className="sy-block-view" onClick={() => startEdit(i)}>
              <MdView md={b} />
            </div>
          )}
        </div>
      ))}

      {editing === blocks.length ? (
        <div
          className="sy-block sy-block-editing"
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Element)) commit();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") commit();
          }}
        >
          <MdArea
            className="sy-block-editor"
            value={draft}
            placeholder={"write…  /  for blocks"}
            minRows={1}
            focusOnMount
            onChange={setDraft}
          />
        </div>
      ) : (
        <button
          className="sy-page-add"
          onDragOver={(e) => {
            if (dragIdx === null) return;
            e.preventDefault();
            setOverIdx(blocks.length);
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (dragIdx !== null) move(dragIdx, blocks.length);
            setDragIdx(null);
            setOverIdx(null);
          }}
          onClick={() => {
            setDraft("");
            setEditing(blocks.length);
          }}
        >
          {blocks.length ? "+ write" : "start writing — type / for blocks"}
        </button>
      )}

      <div className="sy-page-hint">
        click a block to edit · <kbd>/</kbd> for blocks · drag <span className="sy-hint-handle">⋮⋮</span> to
        reorder · empty a block to delete it
      </div>
    </div>
  );
}
