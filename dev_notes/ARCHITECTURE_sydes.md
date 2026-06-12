# sydes — Architecture

*Visual system-design studio that exports markdown — June 2026*

## What sydes is

A canvas for brainstorming system designs — boxes, arrows, tables, notes, layers —
that exports an `ARCHITECTURE.md` with hand-crafted-looking unicode box diagrams.
The output format is the same style as `dev_notes/ARCHITECTURE_*.md` in fetch/dhvan:
that *is* the product.

No backend, no accounts. Everything is client-side; diagrams live in localStorage.

## System map

```
┌──────────────────────────────────────────────────┐
│                  BROWSER (only tier)             │
│                                                  │
│  / (landing)          /studio (the app)          │
│                          │                       │
│              ┌───────────┼───────────┐           │
│              ▼           ▼           ▼           │
│         React Flow   lib/export   lib/storage    │
│         canvas       md+ascii     localStorage   │
└──────────────────────────────────────────────────┘
```

Stack: Next.js 16 (App Router) · React 19 · Tailwind 4 · @xyflow/react 12.
Both routes are static — deployable anywhere (Vercel free tier).

## File map

| Path | What it is |
|---|---|
| `app/page.tsx` | landing page (static, `ld-*` classes) |
| `app/studio/page.tsx` | thin wrapper around the Studio client component |
| `components/studio/Studio.tsx` | orchestrator: state, autosave, tab-extend, drag-drop, diagram switching |
| `components/studio/nodes.tsx` | the 4 node types: Box, Note, Table, Layer |
| `components/studio/WireEdge.tsx` | smoothstep edge with double-click-to-edit label |
| `components/studio/Palette.tsx` | floating component palette (drag or click to add) |
| `components/studio/TopBar.tsx` | name, diagram menu, direction toggle, export button |
| `components/studio/ExportModal.tsx` | md preview, copy/download, json backup/import |
| `lib/types.ts` | node data shapes + DiagramDoc |
| `lib/factory.ts` | node constructors, starter + blank diagrams |
| `lib/storage.ts` | localStorage index + docs (`sydes:index`, `sydes:d:<id>`, `sydes:last`) |
| `lib/export.ts` | **the heart** — canvas → markdown with ascii diagram |
| `app/globals.css` | all styling: tokens, `ld-*` landing, `sy-*` studio |

## Node types

| Type | Data | Exports as |
|---|---|---|
| `box` | `{ title, lines }` | a box in the ascii diagram |
| `note` | `{ text }` | bullet under `## Notes` |
| `table` | `{ title, rows[][] }` | a markdown table (row 0 = header) |
| `layer` | `{ title }` (resizable, zIndex −1) | `## Layers` listing boxes inside its rect |

## The exporter (lib/export.ts)

The algorithm, in order:

1. **Rows** — box nodes clustered by y (a box starts a new row when it sits below
   the previous row's bottom). Within a row, sorted by x.
2. **Columns** — canvas x → character column (8 px/char), overlaps pushed right.
   Box width = longest text + padding; rows stacked with a 3-line connector band.
3. **Boxes painted** onto a character grid (`┌─┐│└┘`, centered title, body lines).
4. **Edges** drawn as connection *bits* (U/D/L/R per cell) then rendered to
   `│ ─ ┬ ┴ ┼ └ ┘ ┌ ┐` — so crossing/merging connectors compose correctly:
   - downward to the next row: drop · junction · `▼`, with fan-out branching
     (`┌──┴──┐`) and labels beside the line; near-aligned targets snap straight
   - same-row adjacent: `──label──►` between the boxes
5. **Everything undrawable** (upward, row-skipping, non-adjacent) goes to a
   `## Connections` code block — never mangled, never silently dropped.
6. Tables, layers, notes appended as plain markdown sections.

## Locked decisions

1. **The export is the product.** Any feature that doesn't survive the round trip
   to readable markdown is decoration.
2. **No backend.** localStorage + json backup. If sync ever matters, it's a later
   phase, not a retrofit.
3. **Undrawable edges are listed, not mangled.** The ascii diagram only contains
   connections it can render cleanly.
4. **Mono aesthetic everywhere** — Geist Mono, paper/ink/coral tokens, flat boxes.
   The canvas should look like the export.

## Verifying

`npx tsc --noEmit` · `npm run build` · exporter smoke test: feed a DiagramDoc to
`toMarkdown()` with tsx and eyeball the ascii.
