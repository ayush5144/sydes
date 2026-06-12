"use client";

import type { NodeKind } from "../../lib/factory";

export type MenuState = {
  kind: "node" | "edge" | "pane";
  id?: string;
  hasLabel?: boolean;
  x: number;
  y: number;
};

export function ContextMenu({
  menu,
  onClose,
  onDuplicate,
  onDeleteNode,
  onDisconnect,
  onClearLabel,
  onAddHere,
}: {
  menu: MenuState;
  onClose: () => void;
  onDuplicate: (id: string) => void;
  onDeleteNode: (id: string) => void;
  onDisconnect: (id: string) => void;
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
          item("duplicate", () => onDuplicate(menu.id!)),
          item("delete", () => onDeleteNode(menu.id!), true),
        ]}
        {menu.kind === "edge" && [
          menu.hasLabel ? item("remove label", () => onClearLabel(menu.id!)) : null,
          item("disconnect", () => onDisconnect(menu.id!), true),
        ]}
        {menu.kind === "pane" && [
          item("add box", () => onAddHere("box", menu.x, menu.y)),
          item("add note", () => onAddHere("note", menu.x, menu.y)),
          item("add table", () => onAddHere("table", menu.x, menu.y)),
          item("add layer", () => onAddHere("layer", menu.x, menu.y)),
        ]}
      </div>
    </>
  );
}
