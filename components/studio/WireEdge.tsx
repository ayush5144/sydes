"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react";
import { useState } from "react";

export function WireEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  markerEnd,
  label,
}: EdgeProps) {
  const { setEdges } = useReactFlow();
  const [editing, setEditing] = useState(false);
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 2,
  });
  const commit = (v: string) => {
    setEdges((es) =>
      es.map((e) => (e.id === id ? { ...e, label: v.trim() || undefined } : e))
    );
    setEditing(false);
  };
  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{ stroke: selected ? "var(--accent)" : "var(--wire)", strokeWidth: 1.4 }}
      />
      <EdgeLabelRenderer>
        <div
          className="sy-edge-label nodrag nopan"
          style={{ transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)` }}
          onDoubleClick={() => setEditing(true)}
        >
          {editing ? (
            <input
              autoFocus
              defaultValue={typeof label === "string" ? label : ""}
              onBlur={(e) => commit(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit((e.target as HTMLInputElement).value);
                if (e.key === "Escape") setEditing(false);
              }}
            />
          ) : label ? (
            <span className={selected ? "sy-sel" : ""}>{label as string}</span>
          ) : selected ? (
            <button onClick={() => setEditing(true)}>+ label</button>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
