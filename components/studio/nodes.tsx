"use client";

import {
  Handle,
  NodeResizer,
  Position,
  useReactFlow,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { useEffect, useRef } from "react";
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
  const titleRef = useRef<HTMLInputElement>(null);
  // a freshly added box should be ready to type into
  useEffect(() => {
    if (selected && !data.title) titleRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const showBody = selected || data.lines.length > 0;
  return (
    <div className={`sy-node sy-box ${selected ? "sy-sel" : ""}`}>
      <input
        ref={titleRef}
        className="nodrag sy-title"
        value={data.title}
        placeholder="COMPONENT"
        spellCheck={false}
        onChange={(e) => updateNodeData(id, { title: e.target.value })}
      />
      {showBody && (
        <MdArea
          className="sy-lines"
          value={data.lines}
          placeholder="detail · detail"
          minRows={1}
          slash={false}
          onChange={(v) => updateNodeData(id, { lines: v })}
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
        autoFocusIfEmpty={selected}
        onChange={(v) => updateNodeData(id, { text: v })}
      />
      <Ports />
    </div>
  );
}

export function TextNode({ id, data, selected }: NodeProps<Node<NoteData, "text">>) {
  const { updateNodeData } = useReactFlow();
  return (
    <div className={`sy-textnode ${selected ? "sy-sel" : ""}`}>
      <MdArea
        className="sy-text-area"
        value={data.text}
        placeholder={"write…  /  for blocks"}
        autoFocusIfEmpty={selected}
        onChange={(v) => updateNodeData(id, { text: v })}
      />
    </div>
  );
}

export function TableNode({ id, data, selected }: NodeProps<Node<TableData, "table">>) {
  const { updateNodeData } = useReactFlow();
  const rows = data.rows;
  const collapsed = !!data.collapsed;
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
      <div className="sy-table-head">
        <button
          className="nodrag sy-collapse"
          title={collapsed ? "expand table" : "minimize table"}
          onClick={() => updateNodeData(id, { collapsed: !collapsed })}
        >
          {collapsed ? "▸" : "▾"}
        </button>
        <input
          className="nodrag sy-title"
          value={data.title}
          placeholder="TABLE"
          spellCheck={false}
          onChange={(e) => updateNodeData(id, { title: e.target.value })}
        />
      </div>
      {collapsed ? (
        <div className="sy-table-mini nodrag" onDoubleClick={() => updateNodeData(id, { collapsed: false })}>
          {Math.max(0, rows.length - 1)} rows · {rows[0]?.length ?? 0} cols
        </div>
      ) : (
        <>
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
        </>
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
