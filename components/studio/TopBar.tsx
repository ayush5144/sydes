"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { DiagramMeta, Direction, FileKind } from "../../lib/types";

export function TopBar(props: {
  name: string;
  onName: (v: string) => void;
  kind: FileKind;
  diagrams: DiagramMeta[];
  currentId: string;
  onSwitch: (id: string) => void;
  onNew: () => void;
  onDelete: () => void;
  direction: Direction;
  onDirection: (d: Direction) => void;
  onExport: () => void;
  saved: boolean;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as HTMLElement)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <header className="sy-topbar">
      <Link href="/" className="sy-wordmark">
        sydes
      </Link>
      <div className="sy-doc" ref={menuRef}>
        <input
          className="sy-doc-name"
          value={props.name}
          spellCheck={false}
          onChange={(e) => props.onName(e.target.value)}
        />
        <button className="sy-doc-toggle" title="your files" onClick={() => setOpen((v) => !v)}>
          files ▾
        </button>
        {open && (
          <div className="sy-doc-menu">
            {props.diagrams.map((d) => (
              <button
                key={d.id}
                className={d.id === props.currentId ? "sy-current" : ""}
                onClick={() => {
                  props.onSwitch(d.id);
                  setOpen(false);
                }}
              >
                <span className="sy-file-glyph">{d.kind === "canvas" ? "▦" : "¶"}</span>
                {d.name || "untitled"}
              </button>
            ))}
            <div className="sy-doc-menu-actions">
              <button
                onClick={() => {
                  props.onNew();
                  setOpen(false);
                }}
              >
                + new
              </button>
              <button
                className="sy-danger"
                onClick={() => {
                  props.onDelete();
                  setOpen(false);
                }}
              >
                delete
              </button>
            </div>
          </div>
        )}
      </div>
      <span className={`sy-saved ${props.saved ? "" : "sy-dirty"}`}>
        {props.saved ? "saved" : "…"}
      </span>
      <div className="sy-spacer" />
      {props.kind === "canvas" && (
        <div className="sy-dir" title="flow direction — where tab places the next box">
          <button
            className={props.direction === "v" ? "sy-on" : ""}
            onClick={() => props.onDirection("v")}
          >
            ↓
          </button>
          <button
            className={props.direction === "h" ? "sy-on" : ""}
            onClick={() => props.onDirection("h")}
          >
            →
          </button>
        </div>
      )}
      <button className="sy-export" onClick={props.onExport}>
        copy / download
      </button>
    </header>
  );
}
