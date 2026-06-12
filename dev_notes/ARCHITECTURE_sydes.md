# sydes — Architecture

*A visual studio for system design and structured notes, exported as markdown — June 2026*

---

## What sydes is

- A **canvas for thinking**: boxes, arrows, tables, notes, plain text, and layer
  zones on one infinite surface.
- One click exports the canvas as a clean `.md` file with a **unicode
  box-drawing diagram** — the same style as the hand-written
  `ARCHITECTURE_*.md` docs in fetch/dhvan. That output format is the product.
- **No backend, no accounts, no settings.** A static site; every byte of user
  data lives in the user's browser (localStorage), with json backup/import as
  the escape hatch. MIT licensed.

---

## System overview

```
┌────────────────────────────────────────────────────────────────────┐
│                        BROWSER (the only tier)                     │
│                                                                    │
│   ┌──────────────┐              ┌───────────────────────────────┐  │
│   │  / (landing) │              │       /studio (the app)       │  │
│   │  static page │              │  TopBar · Palette · Canvas    │  │
│   └──────────────┘              │  Search · FreshTray · MiniMap │  │
│                                 └───────────────┬───────────────┘  │
│                                                 │                  │
│                  ┌──────────────────────────────┼───────────────┐  │
│                  ▼                              ▼               ▼  │
│   ┌────────────────────────┐   ┌────────────────────┐   ┌────────────────┐
│   │  React Flow canvas     │   │  lib/export.ts     │   │  lib/storage.ts│
│   │  nodes · edges · drag  │   │  canvas → markdown │   │  localStorage  │
│   │  menus · modes         │   │  ascii diagrams    │   │  index + docs  │
│   └────────────────────────┘   └────────────────────┘   └────────────────┘
└────────────────────────────────────────────────────────────────────┘
```

Stack: Next.js 16 (App Router) · React 19 · Tailwind 4 · @xyflow/react 12.
Both routes prerender static; Vercel deploys with zero config, no env vars.

---

## Core objects

Everything in sydes is one of six objects. A feature that can't be expressed
as an operation on one of these doesn't belong.

| Object | What it is | Data | Exports as |
|---|---|---|---|
| **Box** | A system component | title + detail lines | a drawn box in the ascii diagram |
| **Note** | A card for jotting (markdown) | text | verbatim md under `## Notes` |
| **Text** | Plain words on the canvas, no card | text | verbatim md section, in canvas top-to-bottom order |
| **Table** | Rows × columns, optional note, collapsible | title, rows, note?, collapsed? | a markdown table + note paragraph |
| **Layer** | A resizable background zone for grouping | title | `**layer:** box · box` under `## Layers` |
| **Wire** | A connection with an optional label | source, target, label? | a drawn arrow, or a `## Connections` line |

A **diagram** (file) = named set of nodes + wires + flow direction. Many can
exist; the `files ▾` menu switches, creates, deletes.

---

## How content editing works (the theory)

- **One editor everywhere.** Every markdown surface (notes, text sections,
  table notes, box details) is the same component, so behavior is identical:
  it auto-grows (content never scrolls inside a card) and focuses itself the
  moment the component is created — you type immediately, never hunt for a
  cursor. The editor holds its own local value, so the caret never jumps
  while node data round-trips through React Flow.
- **Hybrid editing in notes/text (RichMd).** While editing, prose stays raw
  markdown — but **tables and code blocks render as real interactive
  widgets inline**: an editable grid (cells, +row/+col) and a styled code
  block with a language field. The markdown string stays the single source
  of truth: segments are parsed from it and serialized back losslessly on
  every edit. Text areas interleave the widgets so there's always somewhere
  to type; each widget has a hover ✕ to remove the block.
- **Two faces per note/text.** Selected = the hybrid editor above.
  Deselected = fully rendered view: real headings, code blocks with language
  tags, checkboxes, bordered tables, quotes, lists.
- **Safe table ops.** `−row` / `−col` only remove the last row/column when
  every cell in it is empty — everywhere tables exist (canvas component,
  full view, inline widgets). No accidental data loss.
- **Slash commands** (type `/` at the start of a line):

| Command | Inserts |
|---|---|
| `/h2` `/h3` | heading · subheading |
| `/bullet` `/todo` | list item · checkbox item |
| `/code` | fenced code block (caret lands inside) |
| `/quote` `/divider` | quote line · horizontal rule |
| `/table` | a markdown table skeleton |

- **Enter continues structure**: inside a bullet/numbered/todo/quote line,
  Enter carries the marker to the next line (numbers increment, a done `[x]`
  continues as a fresh `[ ]`); Enter on an *empty* item exits the list.

---

## Interaction surfaces — where every action lives

Three right-click menus, each scoped to what makes sense there:

| Right-click on… | Menu |
|---|---|
| **node body** | expand — full view · move — click to place · duplicate · disconnect (if connected) · delete |
| **a connection dot** | connect — click a node · disconnect (if connected) |
| **an arrow** | remove label (if labeled) · disconnect |
| **empty canvas** | add note · text · box · table · layer (at the cursor) |

Per-card affordances (appear on hover):

| Corner | Control | Does |
|---|---|---|
| top-left | ⠿ grip | guaranteed drag handle to move the card |
| top-right | ⋯ dots | opens full view (expand modal) |
| table title | ▾ / ▸ | minimize table to a "n rows · m cols" chip / expand |

---

## The flows

**Adding a component** (five paths, one rule):
1. Drag from the palette → lands at the drop point.
2. Click a palette item → lands at viewport center.
3. Double-click empty canvas → a box at the cursor.
4. Right-click empty canvas → chosen type at the cursor.
5. Tab on a selected box → a connected box below (↓) or right (→), per the
   TopBar direction toggle.

Rule: **spawns never overlap.** The target position is checked against every
existing card; if occupied, sydes searches outward in widening rings (right,
below, diagonals) and uses the first free spot. Layers don't count as
collisions, so spawning inside a zone works. Every new component arrives
selected and focused — typing starts instantly.

**Connecting:**
- Drag from any connection dot to another card — loose mode + a 55px magnetic
  radius means near-misses snap on; dots have invisible padding so precision
  isn't needed. (All four dots are source-type handles: in loose mode React
  Flow only resolves an edge's source among source handles, so this is what
  makes drags started from any side produce valid edges.)
- Or right-click a dot → "connect — click a node" → click the target (hint bar
  shows; esc or empty-canvas click cancels).
- Label an arrow by double-clicking it; ✕ on a selected label disconnects.

**Disconnecting** (four ways): right-click the arrow · right-click the dot or
node body → disconnect · drag an arrow's end off into empty space · select the
arrow and press ⌫.

**Moving:** drag anywhere on a card's border, drag the ⠿ grip, or right-click →
"move" (the card follows the cursor; click places it, esc cancels).

**Deleting:** right-click → delete · select + ⌫ · drag the card onto the
"⌫ delete" bar (appears bottom-right while dragging).

**Finding things on a big canvas:**
- **Search** (top-right) matches every node's content — titles, details, note
  text, every table cell, layer names. Enter/click glides the viewport to the
  match and selects it.
- **MiniMap** (bottom-right, pannable/zoomable) for spatial jumps; +/−/fit
  controls bottom-left.
- **Fresh tray** (top-right, below search): auto-collects components that are
  *empty and unconnected* — spawned and forgotten. Click jumps to one; drag it
  out of the tray onto the canvas to place it. It disappears when nothing is
  stale.

**Full view:** ⋯ or right-click → expand. Notes/text open as one wide
editable surface (the same hybrid editor — live table/code widgets, no
duplicate preview); tables open as a large editable grid with tools; boxes
open big title + details. Same data — close and the card reflects everything.

**Saving:** every change autosaves (debounced 600ms) to localStorage;
the TopBar shows `saved` / `…`. `files ▾` lists all diagrams (most recent
first) with + new and delete. The export modal also offers `.json` backup and
import (imports as a new file, never overwrites).

---

## The exporter — canvas → markdown

`lib/export.ts`, the heart. In order:

1. **Rows** — box nodes clustered by y (a box starts a new row when it sits
   below the previous row's bottom, 12px tolerance).
2. **Columns** — canvas x → character column at 8px/char; overlaps pushed
   right with a 4-char gutter. Box width = longest text + padding.
3. **Stacking** — rows joined by a 3-line connector band: drop · junction ·
   arrowhead.
4. **Boxes painted** onto a character grid: `┌─┐│└┘`, centered title,
   left-aligned body lines.
5. **Wires painted as direction bits** (U/D/L/R per cell) then rendered to
   `│ ─ ┬ ┴ ┼ ├ ┤ └ ┘ ┌ ┐` — fan-outs branch (`┌──┴──┐`), crossing connectors
   merge into correct junctions, near-aligned targets snap to straight drops,
   same-row neighbours get `──label──►`.
6. **Anything undrawable** (upward, row-skipping, non-adjacent horizontal —
   including wires touching notes/text/tables) is listed in a
   `## Connections` code block. Never mangled, never silently dropped.
7. **Then the prose**, in this order: text sections (verbatim, canvas
   top-to-bottom), layers (boxes geometrically inside each zone), tables
   (+ attached notes), notes (verbatim — they're already markdown, so slash
   blocks export as real `##`, fences, `- [ ]`).

Output doc shape: `# name` → date line → `## System diagram` → `## Connections`
→ text sections → `## Layers` → one section per table → `## Notes`.

---

## File map

| Path | Responsibility |
|---|---|
| `app/page.tsx` | landing page |
| `app/studio/page.tsx` | thin wrapper around Studio |
| `components/studio/Studio.tsx` | orchestrator: state, autosave, modes (move/connect), menus, spawn logic, shortcuts |
| `components/studio/nodes.tsx` | Box / Note / Text / Table / Layer + shared TableGrid, Grip, Dots, Ports |
| `components/studio/MdArea.tsx` | the markdown editor: slash menu, list continuation, auto-grow, autofocus, caret-safe local state |
| `components/studio/RichMd.tsx` | hybrid segment editor: md ↔ segments, inline table & code widgets |
| `components/studio/WireEdge.tsx` | the arrow: label editing, ✕ disconnect, wide hit area |
| `components/studio/ContextMenu.tsx` | the four right-click menus |
| `components/studio/ExpandModal.tsx` | full view per node type |
| `components/studio/FreshTray.tsx` | empty + unconnected components tray |
| `components/studio/SearchBar.tsx` | content search + jump |
| `components/studio/Palette.tsx` · `TopBar.tsx` · `ExportModal.tsx` | component palette · file chrome · md/json export |
| `lib/markdown.tsx` | MdView: the safe markdown renderer |
| `lib/export.ts` | the ascii/markdown exporter |
| `lib/storage.ts` | localStorage: `sydes:index` · `sydes:d:<id>` · `sydes:last` |
| `lib/types.ts` · `lib/factory.ts` | data shapes · node constructors, starter/blank files |
| `app/globals.css` | all styling: tokens, `ld-*` landing, `sy-*` studio |

---

## Locked decisions (do not revisit)

1. **The export is the product.** A feature that doesn't survive the round
   trip to readable markdown is decoration.
2. **No backend, no accounts, no settings page.** localStorage + json backup.
3. **Undrawable wires are listed, not mangled.**
4. **One markdown editor, one renderer, everywhere.** Same slash commands,
   same look, on every text surface.
5. **Notes-first.** A new file opens with a focused note; structure is grown
   into, not started from.
6. **Every action has a discoverable path** — right-click menu, a visible
   corner control, and (where natural) a keyboard route. The `?` card explains
   them action-first.
7. **Spawns never overlap and always arrive ready to type.**
8. **Mono aesthetic** — Geist Mono, paper/ink/coral tokens, flat boxes. The
   canvas looks like its own export.
9. **The markdown string is the only model.** Inline widgets (tables, code)
   parse from it and serialize back losslessly — never a parallel data shape.
10. **Destructive table ops only fire on empty targets** (−row/−col).

---

## Verifying

`npx tsc --noEmit` · `npm run lint` · `npm run build` — all clean before any
commit. Exporter smoke test: feed a DiagramDoc to `toMarkdown()` via tsx and
eyeball the ascii against this file's own diagram.

Current state: `dev_notes/CHECKLIST_sydes.md`.
