# sydes — Architecture

*A thinking studio that exports markdown — June 2026*

---

## What sydes is

sydes is a **visual studio for thinking** — system designs, flows, and notes on
one canvas. Boxes, arrows, tables, layers, and markdown notes, exported as a
clean `.md` file with unicode box diagrams. The output format is the same style
as the hand-written `dev_notes/ARCHITECTURE_*.md` files in fetch and dhvan:
**that format is the product.** Everything else is a way of producing it faster.

The mental model: **a canvas is a document you can drag.** Notes are markdown,
tables are markdown, the diagram becomes markdown. Nothing on the canvas exists
that can't survive the round trip to a readable file.

The one rule everything bends around: **no backend.** sydes is a static site;
every byte of user data lives in the user's browser.

---

## System overview

```
┌────────────────────────────────────────────────────────────────────┐
│                        BROWSER (the only tier)                     │
│                                                                    │
│   ┌──────────────┐              ┌───────────────────────────────┐  │
│   │  / (landing) │              │       /studio (the app)       │  │
│   │  static page │              │  TopBar · Palette · Canvas    │  │
│   └──────────────┘              └───────────────┬───────────────┘  │
│                                                 │                  │
│                  ┌──────────────────────────────┼───────────────┐  │
│                  ▼                              ▼               ▼  │
│   ┌────────────────────────┐   ┌────────────────────┐   ┌────────────────┐
│   │  React Flow canvas     │   │  lib/export.ts     │   │  lib/storage.ts│
│   │  nodes · edges · drag  │   │  canvas → markdown │   │  localStorage  │
│   │  context menus · slash │   │  ascii diagrams    │   │  index + docs  │
│   └────────────────────────┘   └────────────────────┘   └────────────────┘
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

Stack: Next.js 16 (App Router) · React 19 · Tailwind 4 · @xyflow/react 12.
Both routes prerender static. Deploys to Vercel with zero config, no env vars.

---

## Layer responsibilities

| Layer | What it does | Why it exists |
|---|---|---|
| **Landing (`/`)** | Pitch + sample + CTA. | So a stranger gets it in ten seconds. |
| **Studio shell** | TopBar (doc name/menu/export), Palette, help card. | One place to operate everything; no settings page, ever. |
| **Canvas (React Flow)** | Drag, connect, select, zoom; context menus; drag-to-delete. | The thinking surface. All interaction happens here. |
| **Node components** | Box, Note, Table, Layer — each edits in place. | No modals for content; you type where the thing is. |
| **MdArea** | Shared markdown textarea with `/` slash commands. | One editing experience for every note-shaped surface. |
| **Exporter (`lib/export.ts`)** | Canvas → markdown with ascii diagram. | The product. Everything upstream serves this. |
| **Storage (`lib/storage.ts`)** | localStorage index + per-doc records, autosave. | Zero-infra persistence; json backup as escape hatch. |

---

## Core objects

Everything in sydes is one of six objects. If a feature can't be expressed as
an operation on one of these, it doesn't belong yet.

| Object | Meaning | Exports as |
|---|---|---|
| **Box** | A component in the system (`{ title, lines }`). | A drawn box in the ascii diagram. |
| **Note** | Freeform markdown (`{ text }`), slash-command blocks. | Verbatim markdown under `## Notes`. |
| **Table** | Rows and columns (`{ title, rows[][], note? }`). | A markdown table + its note paragraph. |
| **Layer** | A labeled zone rectangle behind nodes (`{ title }`). | `**layer:** box · box` under `## Layers`. |
| **Wire** | A connection with optional label. | A drawn arrow, or a `## Connections` line. |
| **Diagram** | One named canvas (`DiagramDoc`): nodes + edges + meta. | One `.md` file. |

---

## The interaction loop (how a session works)

| # | User does | What happens |
|---|---|---|
| 1 | Opens `/studio` | `initialDiagram()` loads last doc from localStorage, or seeds the starter. |
| 2 | Adds things | Palette drag · double-click canvas · right-click → add. `makeNode()` builds it. |
| 3 | Writes | Inputs/textareas edit node data in place. In notes, `/` opens the block menu (heading, code, todo, quote, divider, table). |
| 4 | Connects | Drag from any node edge — loose mode + 55px snap radius makes near-misses land. Double-click an arrow to label it. |
| 5 | Restructures | Tab extends a flow (↓ or → per toggle). Right-click for duplicate/delete/disconnect. Drag onto the corner ⌫ bar to delete. Drag an edge end away to disconnect. |
| 6 | Everything autosaves | Debounced 600ms → `saveDiagram()` → localStorage. "saved" indicator in the TopBar. |
| 7 | Exports | `toMarkdown(doc)` renders the modal preview → copy or download `.md` (or backup/import `.json`). |

---

## The exporter — how canvas becomes ascii

`lib/export.ts`, the heart of the codebase. In order:

1. **Rows** — box nodes clustered by y: a box starts a new row when it sits
   below the previous row's bottom (12px overlap tolerance).
2. **Columns** — canvas x → character column at 8px/char; overlapping boxes
   pushed right with a 4-char gutter. Box width = longest text + padding.
3. **Stacking** — rows are stacked with a 3-line connector band between them:
   line 1 *drop*, line 2 *junction*, line 3 *arrowhead*.
4. **Boxes painted** onto a character grid: `┌─┐ │ └┘`, centered title,
   left-aligned body lines.
5. **Edges painted as direction bits** (U/D/L/R per cell), then rendered to
   `│ ─ ┬ ┴ ┼ ├ ┤ └ ┘ ┌ ┐` — so fan-outs and crossing connectors merge into
   correct junction characters instead of overwriting each other:
   - one box → many in the next row: `┌──┴──┐` branching, `▼` into each target
   - near-aligned targets snap to a straight `│` drop
   - same-row neighbours: `──label──►` drawn in the gap between them
6. **Anything undrawable** — upward edges, row-skipping edges, non-adjacent
   horizontals — is listed in a `## Connections` code block. Never mangled,
   never silently dropped.
7. **Then the prose**: layers (boxes geometrically inside each rect), tables
   (+ attached notes), and notes — notes are emitted *verbatim* because they're
   already markdown (slash blocks produce real `##`, ` ``` `, `- [ ]` syntax).

---

## File map

| Path | What it is |
|---|---|
| `app/page.tsx` | landing (`ld-*` classes) |
| `app/studio/page.tsx` | thin wrapper around Studio |
| `components/studio/Studio.tsx` | orchestrator: state, autosave, shortcuts, drag-drop, trash, menus |
| `components/studio/nodes.tsx` | Box / Note / Table / Layer node components |
| `components/studio/MdArea.tsx` | markdown textarea + slash-command menu |
| `components/studio/ContextMenu.tsx` | right-click menus (node / edge / pane) |
| `components/studio/WireEdge.tsx` | edge with label editing + ✕ disconnect |
| `components/studio/Palette.tsx` | drag-or-click component palette |
| `components/studio/TopBar.tsx` | name, doc menu, direction toggle, export |
| `components/studio/ExportModal.tsx` | md preview, copy/download, json backup |
| `lib/types.ts` · `lib/factory.ts` | data shapes · node constructors + starters |
| `lib/storage.ts` · `lib/export.ts` | localStorage CRUD · the exporter |
| `app/globals.css` | all styling: tokens, `ld-*`, `sy-*` |

Storage keys: `sydes:index` (meta list) · `sydes:d:<id>` (one doc) · `sydes:last`.

---

## Locked decisions (do not revisit)

1. **The export is the product.** A feature that doesn't survive the round trip
   to readable markdown is decoration, and decoration loses.
2. **No backend, no accounts, no settings page.** localStorage + json backup.
   If sync ever matters it's a new phase, not a retrofit.
3. **Undrawable edges are listed, not mangled.** The ascii diagram contains only
   connections it can render cleanly.
4. **One editing experience for markdown.** Anything note-shaped uses MdArea —
   same slash commands, same look — notes today, table notes today, node pages
   and page docs next.
5. **Notes-first.** A new canvas opens with a note, not a structure. Structure
   is something you grow into, not start from.
6. **Every destructive action has a discoverable path**: right-click menu,
   keyboard (⌫), and drag-to-corner all work. Explanations live in the `?` card,
   written action-first ("disconnect — right-click the arrow").
7. **Mono aesthetic everywhere.** Geist Mono, paper/ink/coral tokens, flat
   2px-radius boxes. The canvas should look like its own export.

---

## Verifying

`npx tsc --noEmit` · `npm run lint` · `npm run build` (all three must be clean
before any commit). Exporter smoke test: feed a `DiagramDoc` to `toMarkdown()`
with tsx and eyeball the ascii against this file's own diagrams.

Current state and roadmap: `dev_notes/CHECKLIST_sydes.md`.
