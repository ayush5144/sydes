"use client";

import {
  addEdge,
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  reconnectEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { blankDiagram, makeNode, uid, type NodeKind } from "../../lib/factory";
import { toMarkdown } from "../../lib/export";
import {
  deleteDiagram,
  initialDiagram,
  listDiagrams,
  loadDiagram,
  saveDiagram,
} from "../../lib/storage";
import type { DiagramDoc, DiagramMeta, Direction } from "../../lib/types";
import { ContextMenu, type MenuState } from "./ContextMenu";
import { ExpandModal } from "./ExpandModal";
import { ExpandContext } from "./expand-context";
import { ExportModal } from "./ExportModal";
import { FreshTray } from "./FreshTray";
import { BoxNode, LayerNode, NoteNode, TableNode, TextNode } from "./nodes";
import { Palette } from "./Palette";
import { SearchBar } from "./SearchBar";
import { TopBar } from "./TopBar";
import { WireEdge } from "./WireEdge";

const nodeTypes = {
  box: BoxNode,
  note: NoteNode,
  text: TextNode,
  table: TableNode,
  layer: LayerNode,
};
const edgeTypes = { wire: WireEdge };
const defaultEdgeOptions = {
  type: "wire",
  reconnectable: true,
  markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color: "#9a9a93" },
};

const EXPANDABLE = new Set(["box", "note", "text", "table"]);

function StudioInner() {
  const [ready, setReady] = useState(false);
  const [currentId, setCurrentId] = useState("");
  const [name, setName] = useState("");
  const [direction, setDirection] = useState<Direction>("v");
  const [diagrams, setDiagrams] = useState<DiagramMeta[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [saved, setSaved] = useState(true);
  const [exportMd, setExportMd] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [overTrash, setOverTrash] = useState(false);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [expandId, setExpandId] = useState<string | null>(null);
  const [moveId, setMoveId] = useState<string | null>(null);
  const { screenToFlowPosition, getViewport, addNodes, setCenter } = useReactFlow();
  const wrapRef = useRef<HTMLDivElement>(null);
  const trashRef = useRef<HTMLDivElement>(null);
  const reconnectOk = useRef(true);

  const inTrash = (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
    const r = trashRef.current?.getBoundingClientRect();
    if (!r) return false;
    const p = "touches" in e ? (e.touches[0] ?? e.changedTouches?.[0]) : e;
    return (
      !!p && p.clientX >= r.left && p.clientX <= r.right && p.clientY >= r.top && p.clientY <= r.bottom
    );
  };

  const currentDoc = useCallback(
    (): DiagramDoc => ({
      id: currentId,
      name,
      direction,
      nodes,
      edges,
      updatedAt: Date.now(),
    }),
    [currentId, name, direction, nodes, edges]
  );

  const openDoc = useCallback(
    (doc: DiagramDoc) => {
      setCurrentId(doc.id);
      setName(doc.name);
      setDirection(doc.direction ?? "v");
      setNodes(doc.nodes);
      setEdges(doc.edges);
      setDiagrams(listDiagrams());
    },
    [setNodes, setEdges]
  );

  // load on mount — localStorage is client-only, so this can't be initial state
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    openDoc(initialDiagram());
    setReady(true);
  }, [openDoc]);

  // debounced autosave
  useEffect(() => {
    if (!ready || !currentId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaved(false);
    const t = setTimeout(() => {
      saveDiagram(currentDoc());
      setDiagrams(listDiagrams());
      setSaved(true);
    }, 600);
    return () => clearTimeout(t);
  }, [ready, currentId, currentDoc]);

  const onConnect = useCallback(
    (c: Connection) => setEdges((es) => addEdge({ ...c, id: `e-${uid()}`, type: "wire" }, es)),
    [setEdges]
  );

  const addAt = useCallback(
    (kind: NodeKind, pos: { x: number; y: number }) => {
      // select the new node so its editor focuses and typing starts instantly
      const node = { ...makeNode(kind, pos), selected: true };
      setNodes((ns) => ns.map((n) => ({ ...n, selected: false })).concat(node));
    },
    [setNodes]
  );

  const addFromPalette = useCallback(
    (kind: NodeKind) => {
      const { x, y, zoom } = getViewport();
      const el = wrapRef.current;
      const cx = el ? el.clientWidth / 2 : 400;
      const cy = el ? el.clientHeight / 2 : 300;
      addAt(kind, { x: (cx - x) / zoom - 90, y: (cy - y) / zoom - 30 });
    },
    [addAt, getViewport]
  );

  // tab extends the flow from the selected box
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const tag = (document.activeElement?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      const sel = nodes.filter((n) => n.selected && n.type === "box");
      if (sel.length !== 1) return;
      e.preventDefault();
      const src = sel[0];
      const w = src.measured?.width ?? 200;
      const h = src.measured?.height ?? 70;
      const pos =
        direction === "v"
          ? { x: src.position.x, y: src.position.y + h + 90 }
          : { x: src.position.x + w + 110, y: src.position.y };
      const node = { ...makeNode("box", pos), selected: true };
      setNodes((ns) => ns.map((n) => ({ ...n, selected: false })).concat(node));
      setEdges((es) =>
        es.concat({ id: `e-${uid()}`, source: src.id, target: node.id, type: "wire" })
      );
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nodes, direction, setNodes, setEdges]);

  const switchTo = (id: string) => {
    if (id === currentId) return;
    saveDiagram(currentDoc());
    const doc = loadDiagram(id);
    if (doc) openDoc(doc);
  };

  const newDiagram = () => {
    saveDiagram(currentDoc());
    const doc = blankDiagram();
    saveDiagram(doc);
    openDoc(doc);
  };

  const removeDiagram = () => {
    if (!window.confirm(`delete "${name || "untitled"}"?`)) return;
    deleteDiagram(currentId);
    const rest = listDiagrams();
    if (rest.length) {
      const doc = loadDiagram(rest[0].id);
      if (doc) return openDoc(doc);
    }
    const doc = blankDiagram();
    saveDiagram(doc);
    openDoc(doc);
  };

  const importDoc = (doc: DiagramDoc) => {
    const fresh = { ...doc, id: `d-${uid()}` };
    saveDiagram(fresh);
    openDoc(fresh);
  };

  const duplicateNode = (id: string) => {
    const n = nodes.find((x) => x.id === id);
    if (!n) return;
    addNodes({
      ...n,
      id: `${n.type}-${uid()}`,
      position: { x: n.position.x + 32, y: n.position.y + 32 },
      selected: false,
      data: JSON.parse(JSON.stringify(n.data)),
    });
  };

  const deleteNode = (id: string) => {
    setNodes((ns) => ns.filter((n) => n.id !== id));
    setEdges((es) => es.filter((e) => e.source !== id && e.target !== id));
  };

  // move mode: the card follows the cursor until a click places it
  useEffect(() => {
    if (!moveId) return;
    const onMove = (e: MouseEvent) => {
      const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      setNodes((ns) =>
        ns.map((n) =>
          n.id === moveId
            ? {
                ...n,
                position: {
                  x: pos.x - (n.measured?.width ?? 180) / 2,
                  y: pos.y - (n.measured?.height ?? 50) / 2,
                },
              }
            : n
        )
      );
    };
    const place = () => setMoveId(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoveId(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", place);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", place);
      window.removeEventListener("keydown", onKey);
    };
  }, [moveId, screenToFlowPosition, setNodes]);

  // right-clicking a connection dot opens the node menu
  useEffect(() => {
    const onNodeMenu = (ev: Event) => {
      const { id, x, y } = (ev as CustomEvent<{ id: string; x: number; y: number }>).detail;
      const node = nodes.find((n) => n.id === id);
      if (!node) return;
      setMenu({
        kind: "node",
        id,
        expandable: EXPANDABLE.has(node.type ?? ""),
        connected: edges.some((ed) => ed.source === id || ed.target === id),
        x,
        y,
      });
    };
    window.addEventListener("sydes-node-menu", onNodeMenu);
    return () => window.removeEventListener("sydes-node-menu", onNodeMenu);
  }, [nodes, edges]);

  const jumpTo = (id: string) => {
    const n = nodes.find((x) => x.id === id);
    if (!n) return;
    setCenter(
      n.position.x + (n.measured?.width ?? 200) / 2,
      n.position.y + (n.measured?.height ?? 60) / 2,
      { zoom: 1.15, duration: 500 }
    );
    setNodes((ns) => ns.map((x) => ({ ...x, selected: x.id === id })));
  };

  if (!ready) return <div className="sy-loading">sydes…</div>;

  return (
    <div className="sy-studio">
      <TopBar
        name={name}
        onName={setName}
        diagrams={diagrams}
        currentId={currentId}
        onSwitch={switchTo}
        onNew={newDiagram}
        onDelete={removeDiagram}
        direction={direction}
        onDirection={setDirection}
        onExport={() => setExportMd(toMarkdown(currentDoc()))}
        saved={saved}
      />
      <div
        className="sy-body"
        ref={wrapRef}
        onDoubleClickCapture={(e) => {
          // double-click empty canvas → quick-add a box
          if ((e.target as HTMLElement).classList.contains("react-flow__pane")) {
            const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
            addAt("box", { x: pos.x - 90, y: pos.y - 20 });
          }
        }}
      >
        <Palette onAdd={addFromPalette} />
        <SearchBar nodes={nodes} onJump={jumpTo} />
        <FreshTray nodes={nodes} edges={edges} onJump={jumpTo} />
        <ExpandContext.Provider value={setExpandId}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          connectionMode={ConnectionMode.Loose}
          connectionRadius={55}
          zoomOnDoubleClick={false}
          onReconnectStart={() => {
            reconnectOk.current = false;
          }}
          onReconnect={(oldEdge, conn) => {
            reconnectOk.current = true;
            setEdges((es) => reconnectEdge(oldEdge, conn, es));
          }}
          onReconnectEnd={(_e, edge) => {
            // dropped on empty canvas → disconnect
            if (!reconnectOk.current) setEdges((es) => es.filter((e) => e.id !== edge.id));
            reconnectOk.current = true;
          }}
          onNodeDragStart={() => setDragging(true)}
          onNodeDrag={(e) => setOverTrash(inTrash(e))}
          onNodeDragStop={(e, _node, draggedNodes) => {
            if (inTrash(e)) {
              const ids = new Set(draggedNodes.map((n) => n.id));
              setNodes((ns) => ns.filter((n) => !ids.has(n.id)));
              setEdges((es) => es.filter((ed) => !ids.has(ed.source) && !ids.has(ed.target)));
            }
            setDragging(false);
            setOverTrash(false);
          }}
          onNodeContextMenu={(e, node) => {
            e.preventDefault();
            setMenu({
              kind: "node",
              id: node.id,
              expandable: EXPANDABLE.has(node.type ?? ""),
              connected: edges.some((ed) => ed.source === node.id || ed.target === node.id),
              x: e.clientX,
              y: e.clientY,
            });
          }}
          onEdgeContextMenu={(e, edge) => {
            e.preventDefault();
            setMenu({ kind: "edge", id: edge.id, hasLabel: !!edge.label, x: e.clientX, y: e.clientY });
          }}
          onPaneContextMenu={(e) => {
            e.preventDefault();
            const me = e as MouseEvent;
            setMenu({ kind: "pane", x: me.clientX, y: me.clientY });
          }}
          snapToGrid
          snapGrid={[8, 8]}
          fitView
          minZoom={0.2}
          maxZoom={2}
          proOptions={{ hideAttribution: false }}
          deleteKeyCode={["Backspace", "Delete"]}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
          }}
          onDrop={(e) => {
            e.preventDefault();
            const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
            const moveNodeId = e.dataTransfer.getData("application/sydes-move");
            if (moveNodeId) {
              // dragged from the fresh tray → reposition the existing node
              setNodes((ns) =>
                ns.map((n) =>
                  n.id === moveNodeId
                    ? { ...n, position: { x: pos.x - 90, y: pos.y - 20 }, selected: true }
                    : { ...n, selected: false }
                )
              );
              return;
            }
            const kind = e.dataTransfer.getData("application/sydes") as NodeKind;
            if (!kind) return;
            addAt(kind, { x: pos.x - 90, y: pos.y - 20 });
          }}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#dddcd6" />
          <Controls showInteractive={false} />
          <MiniMap
            position="bottom-right"
            className="sy-minimap"
            pannable
            zoomable
            nodeColor="#d8d7d0"
            maskColor="rgba(250, 250, 248, 0.7)"
          />
        </ReactFlow>
        </ExpandContext.Provider>
        {dragging && (
          <div ref={trashRef} className={`sy-trash ${overTrash ? "sy-trash-hot" : ""}`}>
            ⌫ delete
          </div>
        )}
        {moveId && <div className="sy-move-hint">moving — click to place · esc cancels</div>}
        {!dragging && (
          <button className="sy-help-btn" onClick={() => setHelpOpen((v) => !v)}>
            ?
          </button>
        )}
        {helpOpen && (
          <div className="sy-help">
            <div className="sy-help-row"><span>add</span><span>drag from palette · double-click canvas · right-click</span></div>
            <div className="sy-help-row"><span>full view</span><span>⋯ in a card&apos;s corner · right-click → expand</span></div>
            <div className="sy-help-row"><span>minimize table</span><span>▾ next to its title; double-click to expand</span></div>
            <div className="sy-help-row"><span>find anything</span><span>search bar top-right; minimap to jump around</span></div>
            <div className="sy-help-row"><span>connect</span><span>drag from a node&apos;s edge to another node</span></div>
            <div className="sy-help-row"><span>disconnect</span><span>right-click the arrow · drag its end away</span></div>
            <div className="sy-help-row"><span>label arrow</span><span>double-click the arrow</span></div>
            <div className="sy-help-row"><span>extend flow</span><span>select a box, press <kbd>tab</kbd></span></div>
            <div className="sy-help-row"><span>blocks in notes</span><span>type <kbd>/</kbd> — heading, code, todo…</span></div>
            <div className="sy-help-row"><span>delete</span><span>right-click · select + <kbd>⌫</kbd> · drag to corner</span></div>
          </div>
        )}
        {menu && (
          <ContextMenu
            menu={menu}
            onClose={() => setMenu(null)}
            onExpand={setExpandId}
            onMove={setMoveId}
            onDuplicate={duplicateNode}
            onDeleteNode={deleteNode}
            onDisconnect={(id) => setEdges((es) => es.filter((e) => e.id !== id))}
            onDisconnectNode={(id) =>
              setEdges((es) => es.filter((e) => e.source !== id && e.target !== id))
            }
            onClearLabel={(id) =>
              setEdges((es) => es.map((e) => (e.id === id ? { ...e, label: undefined } : e)))
            }
            onAddHere={(kind, x, y) => {
              const pos = screenToFlowPosition({ x, y });
              addAt(kind, { x: pos.x - 90, y: pos.y - 20 });
            }}
          />
        )}
      </div>
      {exportMd !== null && (
        <ExportModal
          md={exportMd}
          doc={currentDoc()}
          onClose={() => setExportMd(null)}
          onImport={importDoc}
        />
      )}
      {expandId && nodes.find((n) => n.id === expandId) && (
        <ExpandModal
          node={nodes.find((n) => n.id === expandId)!}
          onClose={() => setExpandId(null)}
        />
      )}
    </div>
  );
}

export default function Studio() {
  return (
    <ReactFlowProvider>
      <StudioInner />
    </ReactFlowProvider>
  );
}
