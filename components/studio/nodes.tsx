"use client";

import {
  Handle,
  NodeResizer,
  Position,
  useReactFlow,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import type { BoxData, LayerData, NoteData, TableData } from "../../lib/types";
import { MdArea } from "./MdArea";

function Ports() {
  return (
    <>
      <Handle type="target" position={Position.Top} id="t" />
      <Handle type="target" position={Position.Left} id="l" />
      <Handle type="source" position={Position.Bottom} id="b" />
      <Handle type="source" position={Position.Right} id="r" />
    </>
  );
}

export function BoxNode({ id, data, selected }: NodeProps<Node<BoxData, "box">>) {
  const { updateNodeData } = useReactFlow();
  const showBody = selected || data.lines.length > 0;
  return (
    <div className={`sy-node sy-box ${selected ? "sy-sel" : ""}`}>
      <input
        className="nodrag sy-title"
        value={data.title}
        placeholder="COMPONENT"
        spellCheck={false}
        onChange={(e) => updateNodeData(id, { title: e.target.value })}
      />
      {showBody && (
        <textarea
          className="nodrag sy-lines"
          value={data.lines}
          placeholder="detail · detail"
          spellCheck={false}
          rows={Math.max(1, data.lines.split("\n").length)}
          onChange={(e) => updateNodeData(id, { lines: e.target.value })}
        />
      )}
      <Ports />
    </div>
  );
}

export function NoteNode({ id, data, selected }: NodeProps<Node<NoteData, "note">>) {
  const { updateNodeData } = useReactFlow();
  return (
    <div className={`sy-node sy-note ${selected ? "sy-sel" : ""}`}>
      <MdArea
        className="sy-note-text"
        value={data.text}
        placeholder={"jot here…  /  for blocks"}
        onChange={(v) => updateNodeData(id, { text: v })}
      />
      <Ports />
    </div>
  );
}

export function TableNode({ id, data, selected }: NodeProps<Node<TableData, "table">>) {
  const { updateNodeData } = useReactFlow();
  const rows = data.rows;
  const setCell = (r: number, c: number, v: string) => {
    const next = rows.map((row) => [...row]);
    next[r][c] = v;
    updateNodeData(id, { rows: next });
  };
  const addRow = () => updateNodeData(id, { rows: [...rows, rows[0].map(() => "")] });
  const addCol = () => updateNodeData(id, { rows: rows.map((r) => [...r, ""]) });
  const delRow = () => rows.length > 2 && updateNodeData(id, { rows: rows.slice(0, -1) });
  const delCol = () =>
    rows[0].length > 1 && updateNodeData(id, { rows: rows.map((r) => r.slice(0, -1)) });

  return (
    <div className={`sy-node sy-table ${selected ? "sy-sel" : ""}`}>
      <input
        className="nodrag sy-title"
        value={data.title}
        placeholder="TABLE"
        spellCheck={false}
        onChange={(e) => updateNodeData(id, { title: e.target.value })}
      />
      <table>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c}>
                  <input
                    className={`nodrag ${r === 0 ? "sy-th" : ""}`}
                    value={cell}
                    placeholder={r === 0 ? "col" : ""}
                    spellCheck={false}
                    onChange={(e) => setCell(r, c, e.target.value)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {(data.note !== undefined && (selected || data.note)) && (
        <MdArea
          className="sy-table-note"
          value={data.note ?? ""}
          placeholder={"note for this table…  /  for blocks"}
          minRows={1}
          onChange={(v) => updateNodeData(id, { note: v })}
        />
      )}
      {selected && (
        <div className="sy-table-tools nodrag">
          <button onClick={addRow}>+row</button>
          <button onClick={addCol}>+col</button>
          <button onClick={delRow}>−row</button>
          <button onClick={delCol}>−col</button>
          {data.note === undefined && (
            <button onClick={() => updateNodeData(id, { note: "" })}>+note</button>
          )}
        </div>
      )}
      <Ports />
    </div>
  );
}

export function LayerNode({ id, data, selected }: NodeProps<Node<LayerData, "layer">>) {
  const { updateNodeData } = useReactFlow();
  return (
    <div className={`sy-layer ${selected ? "sy-sel" : ""}`}>
      <NodeResizer isVisible={selected} minWidth={180} minHeight={120} />
      <input
        className="nodrag sy-layer-title"
        value={data.title}
        spellCheck={false}
        onChange={(e) => updateNodeData(id, { title: e.target.value })}
      />
    </div>
  );
}
