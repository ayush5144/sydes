import type { Edge, Node } from "@xyflow/react";
import type { BoxData, DiagramDoc, LayerData, NoteData, TableData } from "./types";

/*
 * Markdown export.
 *
 * Box nodes + the edges between them become a Unicode box-drawing diagram,
 * laid out from canvas positions: boxes are clustered into rows by y, placed
 * into columns by x, and connected through 3-line bands between rows.
 * Edges the renderer can't draw cleanly (upward, row-skipping, non-adjacent
 * horizontal) are listed in a "Connections" section instead of being mangled.
 * Tables, notes and layers export as plain markdown sections.
 */

const CHAR_PX = 8; // canvas px per character column
const BAND = 3; // connector lines between rows: drop · junction · arrow
const MIN_W = 14;

const U = 1, D = 2, L = 4, R = 8;
const BIT_CHAR: Record<number, string> = {
  [L | R]: "─", [U | D]: "│",
  [U | R]: "└", [U | L]: "┘", [D | R]: "┌", [D | L]: "┐",
  [U | D | L]: "┤", [U | D | R]: "├", [U | L | R]: "┴", [D | L | R]: "┬",
  [U | D | L | R]: "┼",
  [U]: "│", [D]: "│", [L]: "─", [R]: "─",
};

type ABox = {
  id: string;
  title: string;
  lines: string[];
  pxX: number;
  pxY: number;
  pxH: number;
  w: number;
  h: number;
  row: number;
  col: number;
  charX: number;
  top: number;
};

const center = (b: ABox) => b.charX + Math.floor(b.w / 2);
const labelOf = (e: Edge) => (typeof e.label === "string" ? e.label.trim() : "");

export function asciiDiagram(
  nodes: Node[],
  edges: Edge[]
): { art: string; drawnEdgeIds: Set<string> } {
  const drawnEdgeIds = new Set<string>();
  const boxes: ABox[] = nodes
    .filter((n) => n.type === "box")
    .map((n) => {
      const d = n.data as BoxData;
      const title = (d.title || "untitled").trim();
      const lines = (d.lines || "")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      const w = Math.max(MIN_W, title.length + 4, ...lines.map((l) => l.length + 4));
      const h = 3 + lines.length; // borders + title + body
      return {
        id: n.id,
        title,
        lines,
        pxX: n.position.x,
        pxY: n.position.y,
        pxH: n.measured?.height ?? 80,
        w,
        h,
        row: 0,
        col: 0,
        charX: 0,
        top: 0,
      };
    });

  if (!boxes.length) return { art: "", drawnEdgeIds };

  // --- cluster into rows by vertical position
  boxes.sort((a, b) => a.pxY - b.pxY);
  const rows: ABox[][] = [];
  let curBottom = -Infinity;
  for (const b of boxes) {
    if (!rows.length || b.pxY > curBottom - 12) {
      rows.push([b]);
      curBottom = b.pxY + b.pxH;
    } else {
      rows[rows.length - 1].push(b);
      curBottom = Math.max(curBottom, b.pxY + b.pxH);
    }
  }

  // --- assign character columns within each row
  rows.forEach((row, ri) => {
    row.sort((a, b) => a.pxX - b.pxX);
    let prevEnd = -4;
    row.forEach((b, ci) => {
      b.row = ri;
      b.col = ci;
      b.charX = Math.max(prevEnd + 4, Math.round(b.pxX / CHAR_PX));
      prevEnd = b.charX + b.w;
    });
  });
  const minX = Math.min(...boxes.map((b) => b.charX));
  boxes.forEach((b) => (b.charX -= minX));

  // --- vertical layout: rows stacked with connector bands between
  const rowH = rows.map((r) => Math.max(...r.map((b) => b.h)));
  const tops: number[] = [];
  let y = 0;
  rows.forEach((r, i) => {
    tops[i] = y;
    r.forEach((b) => (b.top = y));
    y += rowH[i] + BAND;
  });
  const H = y - BAND;
  const W = Math.max(...boxes.map((b) => b.charX + b.w)) + 28; // label margin

  const grid: string[][] = Array.from({ length: H }, () => Array(W).fill(" "));
  const bits: number[][] = Array.from({ length: H }, () => Array(W).fill(0));

  const inGrid = (r: number, c: number) => r >= 0 && r < H && c >= 0 && c < W;
  const put = (r: number, c: number, ch: string) => {
    if (inGrid(r, c)) grid[r][c] = ch;
  };
  const addBits = (r: number, c: number, v: number) => {
    if (inGrid(r, c)) bits[r][c] |= v;
  };
  const isFree = (r: number, c: number) =>
    inGrid(r, c) && grid[r][c] === " " && bits[r][c] === 0;
  const tryText = (r: number, c: number, text: string): boolean => {
    for (let i = 0; i < text.length; i++) if (!isFree(r, c + i)) return false;
    for (let i = 0; i < text.length; i++) put(r, c + i, text[i]);
    return true;
  };

  // --- draw boxes
  for (const b of boxes) {
    const { charX: x, top: t, w, h } = b;
    put(t, x, "┌");
    put(t, x + w - 1, "┐");
    put(t + h - 1, x, "└");
    put(t + h - 1, x + w - 1, "┘");
    for (let c = x + 1; c < x + w - 1; c++) {
      put(t, c, "─");
      put(t + h - 1, c, "─");
    }
    for (let r = t + 1; r < t + h - 1; r++) {
      put(r, x, "│");
      put(r, x + w - 1, "│");
      for (let c = x + 1; c < x + w - 1; c++) put(r, c, " ");
    }
    const pad = Math.floor((w - 2 - b.title.length) / 2);
    b.title.split("").forEach((ch, i) => put(t + 1, x + 1 + pad + i, ch));
    b.lines.forEach((line, li) =>
      line.split("").forEach((ch, i) => put(t + 2 + li, x + 2 + i, ch))
    );
  }

  // --- classify edges
  const byId = new Map(boxes.map((b) => [b.id, b]));
  const downBySource = new Map<string, { tgt: ABox; e: Edge }[]>();
  const horizontals: Edge[] = [];
  for (const e of edges) {
    const s = byId.get(e.source);
    const t = byId.get(e.target);
    if (!s || !t) continue;
    if (t.row === s.row + 1) {
      const list = downBySource.get(s.id) ?? [];
      list.push({ tgt: t, e });
      downBySource.set(s.id, list);
    } else if (t.row === s.row && Math.abs(t.col - s.col) === 1) {
      horizontals.push(e);
    }
  }

  // --- horizontal arrows between adjacent boxes in the same row
  for (const e of horizontals) {
    const s = byId.get(e.source)!;
    const t = byId.get(e.target)!;
    const [a, b] = s.col < t.col ? [s, t] : [t, s];
    const lineY = tops[s.row] + 1 + Math.floor(Math.min(s.h, t.h) / 2) - 1;
    const x0 = a.charX + a.w;
    const x1 = b.charX - 1;
    if (x1 - x0 < 2) continue;
    let ok = true;
    for (let c = x0; c <= x1; c++) if (!isFree(lineY, c)) ok = false;
    if (!ok) continue;
    let run = "─".repeat(x1 - x0 + 1);
    const lbl = labelOf(e);
    if (lbl && lbl.length + 4 <= run.length) {
      const at = Math.floor((run.length - lbl.length) / 2);
      run = run.slice(0, at) + lbl + run.slice(at + lbl.length);
    }
    if (s.col < t.col) run = run.slice(0, -1) + "►";
    else run = "◄" + run.slice(1);
    run.split("").forEach((ch, i) => put(lineY, x0 + i, ch));
    drawnEdgeIds.add(e.id);
  }

  // --- downward edges: drop · junction · arrow, with fan-out branching
  for (const [sid, list] of downBySource) {
    const s = byId.get(sid)!;
    const sc = center(s);
    const L0 = tops[s.row] + rowH[s.row];
    const L1 = L0 + 1;
    const L2 = L0 + 2;
    // drop from the box bottom through any tall-row gap down to L0
    for (let r = s.top + s.h; r <= L0; r++) addBits(r, sc, U | D);
    // snap near-aligned targets to the source column for straight drops
    const cols = list.map(({ tgt }) => {
      const ct = center(tgt);
      return Math.abs(ct - sc) <= 1 ? sc : ct;
    });
    const lo = Math.min(sc, ...cols);
    const hi = Math.max(sc, ...cols);
    for (let c = lo; c <= hi; c++) {
      let v = 0;
      if (c > lo) v |= L;
      if (c < hi) v |= R;
      if (c === sc) v |= U;
      if (cols.includes(c)) v |= D;
      if (v) addBits(L1, c, v);
    }
    list.forEach(({ e }, i) => {
      const ct = cols[i];
      put(L2, ct, "▼");
      const lbl = labelOf(e);
      if (lbl && !tryText(L0, ct + 2, lbl)) tryText(L1, hi + 2, lbl);
      drawnEdgeIds.add(e.id);
    });
  }

  // --- render connector bits where no box character sits
  for (let r = 0; r < H; r++)
    for (let c = 0; c < W; c++)
      if (grid[r][c] === " " && bits[r][c]) grid[r][c] = BIT_CHAR[bits[r][c]] ?? " ";

  const art = grid
    .map((row) => row.join("").replace(/\s+$/, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
  return { art, drawnEdgeIds };
}

function nodeName(n: Node): string {
  if (n.type === "box" || n.type === "layer")
    return ((n.data as BoxData | LayerData).title || "untitled").trim() || "untitled";
  if (n.type === "table") return ((n.data as TableData).title || "table").trim() || "table";
  if (n.type === "text") {
    const first = (n.data as NoteData).text.split("\n")[0].replace(/^#+\s*/, "").trim();
    return first || "text";
  }
  return "note";
}

const mdCell = (s: string) => s.replace(/\|/g, "\\|").trim();

export function toMarkdown(doc: DiagramDoc): string {
  const { nodes, edges, name } = doc;
  const parts: string[] = [`# ${name.trim() || "untitled system"}`];
  parts.push(
    `*Exported from sydes — ${new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}*`
  );

  const { art, drawnEdgeIds } = asciiDiagram(nodes, edges);
  if (art) parts.push(`## System diagram`, "```\n" + art + "\n```");

  // connections the diagram couldn't draw
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const rest = edges.filter(
    (e) => !drawnEdgeIds.has(e.id) && byId.has(e.source) && byId.has(e.target)
  );
  if (rest.length) {
    const lines = rest.map((e) => {
      const lbl = typeof e.label === "string" && e.label.trim() ? `─${e.label.trim()}─` : "──";
      return `${nodeName(byId.get(e.source)!)} ─${lbl}► ${nodeName(byId.get(e.target)!)}`;
    });
    parts.push(`## Connections`, "```\n" + lines.join("\n") + "\n```");
  }

  // text sections — verbatim markdown, in top-to-bottom canvas order
  const texts = nodes
    .filter((n) => n.type === "text")
    .sort((a, b) => a.position.y - b.position.y)
    .map((n) => (n.data as NoteData).text.trim())
    .filter(Boolean);
  parts.push(...texts);

  // layers: list the boxes geometrically inside each layer rect
  const layers = nodes.filter((n) => n.type === "layer");
  if (layers.length) {
    const lines = layers.map((ly) => {
      const w = Number(ly.style?.width ?? ly.measured?.width ?? 0);
      const h = Number(ly.style?.height ?? ly.measured?.height ?? 0);
      const inside = nodes
        .filter((n) => n.type !== "layer" && n.id !== ly.id)
        .filter((n) => {
          const cx = n.position.x + (n.measured?.width ?? 100) / 2;
          const cy = n.position.y + (n.measured?.height ?? 40) / 2;
          return (
            cx >= ly.position.x &&
            cx <= ly.position.x + w &&
            cy >= ly.position.y &&
            cy <= ly.position.y + h
          );
        })
        .map(nodeName);
      const title = (ly.data as LayerData).title || "layer";
      return inside.length ? `- **${title}:** ${inside.join(" · ")}` : `- **${title}**`;
    });
    parts.push(`## Layers`, lines.join("\n"));
  }

  // tables (with their attached notes)
  const tables = nodes.filter((n) => n.type === "table");
  for (const t of tables) {
    const d = t.data as TableData;
    if (!d.rows.length) continue;
    const header = d.rows[0];
    const md = [
      `| ${header.map(mdCell).join(" | ")} |`,
      `|${header.map(() => "---").join("|")}|`,
      ...d.rows.slice(1).map((r) => `| ${r.map(mdCell).join(" | ")} |`),
    ].join("\n");
    parts.push(`## ${(d.title || "table").trim() || "table"}`, md);
    if (d.note?.trim()) parts.push(d.note.trim());
  }

  // notes — verbatim: they're markdown already (slash blocks, code, headings)
  const noteTexts = nodes
    .filter((n) => n.type === "note")
    .map((n) => (n.data as NoteData).text.trim())
    .filter(Boolean);
  if (noteTexts.length) parts.push(`## Notes`, noteTexts.join("\n\n---\n\n"));

  return parts.join("\n\n") + "\n";
}
