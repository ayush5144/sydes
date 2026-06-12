# sydes — Checklist

`[ ]` = todo, `[x]` = done. Done means done.

## Phase 0 — MVP (shipped)

- [x] Scaffold: Next.js 16 + Tailwind 4 + @xyflow/react 12
- [x] Landing page (`/`) — hero, ascii sample, features, CTA
- [x] Studio canvas (`/studio`) — pan/zoom, snap grid, dots background
- [x] Box node (title + body lines, edit in place)
- [x] Note node (freeform sticky)
- [x] Table node (editable cells, +/− rows & cols, header row)
- [x] Layer node (resizable group rectangle, sits behind)
- [x] Edges: 4-side handles, arrowheads, double-click-to-edit labels
- [x] Palette: drag-and-drop or click to add
- [x] Tab extends flow from selected box (↓ or → per direction toggle)
- [x] Autosave to localStorage (debounced), multiple named diagrams
- [x] Diagram menu: switch, new, delete
- [x] Export modal: markdown preview, copy, download .md
- [x] JSON backup / import
- [x] MD exporter: ascii boxes, fan-out junctions, labels, fallback
      connections list, tables, notes, layers
- [x] Clean build, both routes static
- [x] Drag-to-delete drop zone (appears while dragging a node)
- [x] Smoother connecting: loose connection mode + 55px snap radius +
      always-faintly-visible handles + invisible handle padding
- [x] Disconnect: drag edge end away · ✕ on selected edge · right-click
- [x] Right-click menus: node (duplicate/delete) · edge (remove label/
      disconnect) · canvas (add box/note/table/layer)
- [x] Slash commands in notes (/h2 /code /todo /quote /divider /table)
      via shared MdArea component
- [x] Table notes: +note on a selected table, exports under the table
- [x] Notes export verbatim (they are markdown)
- [x] Notes-first: new canvas starts with a note, not a box
- [x] ? help card, action-first wording; double-click canvas adds a box
- [x] Rendered markdown view mode: notes/text show real headings, code
      blocks, tables, todos, quotes when not being edited (lib/markdown.tsx)
- [x] Full view (expand): ⋯ on every card + right-click → expand; notes/
      text get editor + live preview split, tables get a big editable grid
- [x] Search bar (top-right): searches every node, jump-to + select
- [x] MiniMap (pannable/zoomable) for canvas navigation
- [x] Text node: plain markdown on the canvas, no card; exports verbatim
      in canvas top-to-bottom order
- [x] Tables minimize/expand (▾ chevron → "n rows · m cols" chip)
- [x] Enter continues lists/todos/quotes in the editor; empty item exits
- [x] Drag grip (⠿) in every card's top-left corner
- [x] Right-click node → disconnect (removes all its connections)
- [x] Dot menu: right-click a connection dot → connect (click a target)
      · disconnect — nothing else
- [x] Move mode: right-click → move, card follows cursor, click places
- [x] Fresh tray: empty + unconnected components collected top-right;
      click jumps, drag places
- [x] No-overlap spawning: new components ring-search for a free spot
- [x] All textareas auto-grow (no inner scrolling); new components spawn
      selected + focused
- [x] MIT LICENSE; Vercel-ready (static, zero config)
- [x] Dot menu: right-click a connection dot → connect (click target) ·
      disconnect; node menu gains move + disconnect
- [x] Fix: caret no longer jumps while typing (editor keeps local value;
      React Flow's async data round-trip was resetting the cursor)
- [x] Fix: React Flow error #008 freeze — all four dots are source-type
      handles so edges started from any side resolve in loose mode
- [x] Enter continues lists/todos/quotes; empty item exits the list
- [x] RichMd hybrid editor in notes/text: /table → real editable grid
      inline, /code → real code block with language field, while editing;
      markdown string stays the single source of truth (lossless ↔)
- [x] −row/−col only remove an empty row/column (all table surfaces)
- [x] Full view for notes/text = one editable RichMd surface (preview
      pane removed)

Direction note: the md-first / pages-and-blocks experiment (block document
editor) was tried and rolled back — sydes stays a canvas studio that exports
markdown. The attempt remains in git history if pieces are ever wanted.

## Next (open, unordered — pick when needed)

- [ ] Undo/redo, Cmd+D duplicate
- [ ] Tidy button: snap boxes into clean rows/columns
- [ ] Templates on new canvas (layered app · pipeline · data model · blank)
- [ ] ⌘K palette: commands + search across files
- [ ] Save-to-folder (File System Access API) → write md into a repo's
      dev_notes/; zip export of all files

## Deferred (only if it earns it)

- [ ] BYOK AI assist (describe → draft diagram; critique architecture)
- [ ] MD import (parse an existing ARCHITECTURE.md into nodes)
- [ ] Shareable links (URL-compressed diagram)
