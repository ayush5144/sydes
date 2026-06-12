"use client";

import {
  Handle,
  NodeResizer,
  Position,
  useReactFlow,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { useContext, useEffect, useRef } from "react";
import { MdView } from "../../lib/markdown";
import type { BoxData, LayerData, NoteData, TableData } from "../../lib/types";
import { ExpandContext } from "./expand-context";
import { MdArea } from "./MdArea";

function Ports({ nodeId }: { nodeId: string }) {
  // right-clicking a connection dot opens the node menu (with disconnect)
  const onMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent("sydes-node-menu", {
        detail: { id: nodeId, x: e.clientX, y: e.clientY },
      })
    );
  };
  // all handles are type "source": in loose connection mode React Flow only
  // resolves an edge's sourceHandle among source-type handles, so a drag
  // started from a target-type dot produced unresolvable edges (error #008,
  // render-loop console spam, frozen page). Sources can both start and
  // receive connections in loose mode; ids stay t/l/b/r so saved edges work.
  return (
    <>
      <Handle type="source" position={Position.Top} id="t" onContextMenu={onMenu} />
      <Handle type="source" position={Position.Left} id="l" onContextMenu={onMenu} />
      <Handle type="source" position={Position.Bottom} id="b" onContextMenu={onMenu} />
      <Handle type="source" position={Position.Right} id="r" onContextMenu={onMenu} />
    </>
  );
}

/* drag affordance — no "nodrag" class, so grabbing it moves the node */
function Grip() {
  return (
    <span className="sy-grip" title="drag to move">
      ⠿
    </span>
  );
}

/* /table in a note/text spawns a real table component next to this node */
const spawnTableNear = (nearId: string) => () =>
  window.dispatchEvent(new CustomEvent("sydes-spawn-table", { detail: { nearId } }));

function Dots({ id }: { id: string }) {
  const open = useContext(ExpandContext);
  return (
    <button
      className="nodrag sy-dots"
      title="expand"
      onClick={(e) => {
        e.stopPropagation();
        open(id);
      }}
    >
      ⋯
    </button>
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
      <Grip />
      <Dots id={id} />
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
      <Ports nodeId={id} />
    </div>
  );
}

export function NoteNode({ id, data, selected }: NodeProps<Node<NoteData, "note">>) {
  const { updateNodeData } = useReactFlow();
  return (
    <div className={`sy-node sy-note ${selected ? "sy-sel" : ""}`}>
      <Grip />
      <Dots id={id} />
      {selected ? (
        <MdArea
          className="sy-note-text"
          value={data.text}
          placeholder={"jot here…  /  for blocks"}
          focusOnMount
          onSpawnTable={spawnTableNear(id)}
          onChange={(v) => updateNodeData(id, { text: v })}
        />
      ) : (
        <MdView md={data.text} className="sy-note-text" />
      )}
      <Ports nodeId={id} />
    </div>
  );
}

export function TextNode({ id, data, selected }: NodeProps<Node<NoteData, "text">>) {
  const { updateNodeData } = useReactFlow();
  return (
    <div className={`sy-textnode ${selected ? "sy-sel" : ""}`}>
      <Grip />
      <Dots id={id} />
      {selected ? (
        <MdArea
          className="sy-text-area"
          value={data.text}
          placeholder={"write…  /  for blocks"}
          focusOnMount
          onSpawnTable={spawnTableNear(id)}
          onChange={(v) => updateNodeData(id, { text: v })}
        />
      ) : (
        <MdView md={data.text} className="sy-text-area" />
      )}
    </div>
  );
}

/** The editable grid — shared by the canvas table node and the expand modal. */
export function TableGrid({
  id,
  data,
  tools,
  big,
}: {
  id: string;
  data: TableData;
  tools: boolean;
  big?: boolean;
}) {
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
    <>
      <table className={big ? "sy-grid-big" : undefined}>
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
      {tools && (
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
  );
}

export function TableNode({ id, data, selected }: NodeProps<Node<TableData, "table">>) {
  const { updateNodeData } = useReactFlow();
  const collapsed = !!data.collapsed;
  return (
    <div className={`sy-node sy-table ${selected ? "sy-sel" : ""}`}>
      <Grip />
      <Dots id={id} />
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
        <div
          className="sy-table-mini nodrag"
          onDoubleClick={() => updateNodeData(id, { collapsed: false })}
        >
          {Math.max(0, data.rows.length - 1)} rows · {data.rows[0]?.length ?? 0} cols
        </div>
      ) : (
        <>
          <TableGrid id={id} data={data} tools={selected} />
          {data.note !== undefined && (selected || data.note) && (
            <MdArea
              className="sy-table-note"
              value={data.note ?? ""}
              placeholder={"note for this table…  /  for blocks"}
              minRows={1}
              onChange={(v) => updateNodeData(id, { note: v })}
            />
          )}
        </>
      )}
      <Ports nodeId={id} />
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
