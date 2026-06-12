"use client";

import { useReactFlow, type Node } from "@xyflow/react";
import { MdView } from "../../lib/markdown";
import type { BoxData, NoteData, TableData } from "../../lib/types";
import { MdArea } from "./MdArea";
import { TableGrid } from "./nodes";

const KIND_LABEL: Record<string, string> = {
  box: "box",
  note: "note",
  text: "text",
  table: "table",
};

/** Full view of a single node — edit on the left, rendered markdown on the right. */
export function ExpandModal({ node, onClose }: { node: Node; onClose: () => void }) {
  const { updateNodeData } = useReactFlow();
  const id = node.id;

  return (
    <div className="sy-modal-back" onClick={onClose}>
      <div className="sy-modal sy-expand" onClick={(e) => e.stopPropagation()}>
        <div className="sy-modal-head">
          <span>{KIND_LABEL[node.type ?? ""] ?? node.type} — full view</span>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="sy-expand-body">
          {(node.type === "note" || node.type === "text") && (
            <div className="sy-expand-split">
              <MdArea
                className="sy-expand-editor"
                value={(node.data as NoteData).text}
                placeholder={"write…  /  for blocks"}
                minRows={10}
                focusOnMount
                onChange={(v) => updateNodeData(id, { text: v })}
              />
              <div className="sy-expand-preview">
                <MdView md={(node.data as NoteData).text} />
              </div>
            </div>
          )}
          {node.type === "box" && (
            <div className="sy-expand-box">
              <input
                className="sy-expand-title"
                value={(node.data as BoxData).title}
                placeholder="COMPONENT"
                spellCheck={false}
                onChange={(e) => updateNodeData(id, { title: e.target.value })}
              />
              <MdArea
                className="sy-expand-editor"
                value={(node.data as BoxData).lines}
                placeholder="detail · detail"
                minRows={6}
                slash={false}
                onChange={(v) => updateNodeData(id, { lines: v })}
              />
            </div>
          )}
          {node.type === "table" && (
            <div className="sy-expand-table">
              <input
                className="sy-expand-title"
                value={(node.data as TableData).title}
                placeholder="TABLE"
                spellCheck={false}
                onChange={(e) => updateNodeData(id, { title: e.target.value })}
              />
              <TableGrid id={id} data={node.data as TableData} tools big />
              {(node.data as TableData).note !== undefined && (
                <MdArea
                  className="sy-table-note"
                  value={(node.data as TableData).note ?? ""}
                  placeholder={"note for this table…  /  for blocks"}
                  minRows={2}
                  onChange={(v) => updateNodeData(id, { note: v })}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
