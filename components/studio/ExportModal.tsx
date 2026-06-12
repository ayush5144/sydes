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
          <button onClick={() => download(`${slug(file.name)}.md`, md, "text/markdown")}>
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
            import .json
            <input
              type="file"
              accept="application/json"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  const parsed = JSON.parse(await f.text()) as SydesFile;
                  if (parsed && (typeof parsed.content === "string" || Array.isArray(parsed.nodes))) {
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
