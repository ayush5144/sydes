"use client";

import type { NodeKind } from "../../lib/factory";

export type MenuState = {
  kind: "node" | "edge" | "pane" | "dot";
  id?: string;
  hasLabel?: boolean;
  expandable?: boolean;
  connected?: boolean;
  x: number;
  y: number;
};

export function ContextMenu({
  menu,
  onClose,
  onExpand,
  onMove,
  onStartConnect,
  onDuplicate,
  onDeleteNode,
  onDisconnect,
  onDisconnectNode,
  onClearLabel,
  onAddHere,
}: {
  menu: MenuState;
  onClose: () => void;
  onExpand: (id: string) => void;
  onMove: (id: string) => void;
  onStartConnect: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDeleteNode: (id: string) => void;
  onDisconnect: (id: string) => void;
  onDisconnectNode: (id: string) => void;
  onClearLabel: (id: string) => void;
  onAddHere: (kind: NodeKind, x: number, y: number) => void;
}) {
  const item = (name: string, action: () => void, danger = false) => (
    <button
      key={name}
      className={danger ? "sy-danger" : ""}
      onClick={() => {
        action();
        onClose();
      }}
    >
      {name}
    </button>
  );

  return (
    <>
      <div className="sy-menu-back" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }} />
      <div className="sy-menu" style={{ left: menu.x, top: menu.y }}>
        {menu.kind === "node" && [
          menu.expandable ? item("expand — full view", () => onExpand(menu.id!)) : null,
          item("move — click to place", () => onMove(menu.id!)),
          item("duplicate", () => onDuplicate(menu.id!)),
          menu.connected ? item("disconnect", () => onDisconnectNode(menu.id!)) : null,
          item("delete", () => onDeleteNode(menu.id!), true),
        ]}
        {menu.kind === "dot" && [
          item("connect — click a node", () => onStartConnect(menu.id!)),
          menu.connected ? item("disconnect", () => onDisconnectNode(menu.id!), true) : null,
        ]}
        {menu.kind === "edge" && [
          menu.hasLabel ? item("remove label", () => onClearLabel(menu.id!)) : null,
          item("disconnect", () => onDisconnect(menu.id!), true),
        ]}
        {menu.kind === "pane" && [
          item("add note", () => onAddHere("note", menu.x, menu.y)),
          item("add text", () => onAddHere("text", menu.x, menu.y)),
          item("add box", () => onAddHere("box", menu.x, menu.y)),
          item("add table", () => onAddHere("table", menu.x, menu.y)),
          item("add layer", () => onAddHere("layer", menu.x, menu.y)),
        ]}
      </div>
    </>
  );
}
