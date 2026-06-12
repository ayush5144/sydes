"use client";

import { useState } from "react";
import type { SydesFile } from "../../lib/types";

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const slug = (s: string) =>
  s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "diagram";

/** The saved .md = readable markdown + the workspace data in an html
 *  comment, so the file reads perfectly anywhere and reopens editable. */
function mdWithData(md: string, file: SydesFile): string {
  const data = JSON.stringify({
    name: file.name,
    direction: file.direction,
    nodes: file.nodes,
    edges: file.edges,
  }).replace(/-->/g, "--\\u003e");
  return `${md.trimEnd()}\n\n<!-- sydes:canvas ${data} -->\n`;
}

export function parseMdFile(text: string, fallbackName: string): SydesFile | null {
  const m = text.match(/<!-- sydes:canvas ([\s\S]*?) -->/);
  if (m) {
    try {
      const data = JSON.parse(m[1]);
      return {
        id: "tmp",
        name: data.name || fallbackName,
        kind: "canvas",
        direction: data.direction ?? "v",
        nodes: data.nodes ?? [],
        edges: data.edges ?? [],
        updatedAt: 0,
      };
    } catch {
      return null;
    }
  }
  // plain markdown from anywhere → becomes a text element
  return { id: "tmp", name: fallbackName, kind: "md", content: text, updatedAt: 0 };
}

export function ExportModal({
  md,
  file,
  onClose,
  onImport,
}: {
  md: string;
  file: SydesFile;
  onClose: () => void;
  onImport: (doc: SydesFile) => void;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="sy-modal-back" onClick={onClose}>
      <div className="sy-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sy-modal-head">
          <span>export</span>
          <button onClick={onClose}>✕</button>
        </div>
        <pre className="sy-modal-pre">{md}</pre>
        <div className="sy-modal-actions">
          <button
            className="sy-primary"
            onClick={async () => {
              await navigator.clipboard.writeText(md);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? "copied ✓" : "copy markdown"}
          </button>
          <button onClick={() => download(`${slug(file.name)}.md`, mdWithData(md, file), "text/markdown")}>
            download .md
          </button>
          <div className="sy-spacer" />
          <button
            className="sy-quiet"
            onClick={() =>
              download(`${slug(file.name)}.json`, JSON.stringify(file, null, 2), "application/json")
            }
          >
            backup .json
          </button>
          <label className="sy-quiet sy-filebtn">
            import .md / .json
            <input
              type="file"
              accept=".md,.json,text/markdown,application/json"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  const text = await f.text();
                  let parsed: SydesFile | null = null;
                  if (f.name.endsWith(".json")) {
                    const j = JSON.parse(text) as SydesFile;
                    if (j && (typeof j.content === "string" || Array.isArray(j.nodes))) parsed = j;
                  } else {
                    parsed = parseMdFile(text, f.name.replace(/\.md$/, ""));
                  }
                  if (parsed) {
                    onImport(parsed);
                    onClose();
                  }
                } catch {
                  /* ignore bad files */
                }
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
