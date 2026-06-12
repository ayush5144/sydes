# sydes — Checklist

`[ ]` = todo, `[x]` = done. Done means done.
Direction: `DIRECTION_md_first.md` — pure markdown, no canvas (v2).

## v2 Phase A — the document editor (shipped)

- [x] SydesFile model: kind "md" | "canvas"; legacy canvas files still open
- [x] New file = markdown document (md-first default); welcome doc on first run
- [x] Block editor: md string is source of truth, parse/serialize blocks
      (lib/blocks.ts), click block to edit raw, click away renders
- [x] Slash inserts + Enter list-continuation inside blocks (MdArea)
- [x] ⋮⋮ drag to reorder blocks; empty a block to delete it
- [x] Sydes html comments hidden in render (⌁ marker)
- [x] Export modal for md = the file itself (copy / download / json backup)
- [x] files ▾ menu shows ¶/▦ kind glyphs; direction toggle canvas-only
- [x] Landing copy updated to md-first pitch

## v2 Phase B — rich blocks (NEXT — flow block needs re-approval, see direction doc)

- [ ] Table block: click a md table → edit in the rich grid (TableGrid)
- [ ] Flow block (PROPOSED, not approved): `a -> b: label` lines →
      live ascii diagram via the layout engine; source in html comment
- [ ] Code block: language tag + monospace editing comfort

## v2 Phase C — cleanup & brain

- [ ] Canvas → document migration (run exporter once, embed sources)
- [ ] Delete React Flow + canvas UI entirely
- [ ] [[links]] between files; cross-file search
- [ ] Save-to-folder (File System Access) · zip export of workspace

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

## Phase 1 — pages & blocks (the notes direction)

sydes = canvases AND pages. A doc is either a canvas (diagram) or a page
(Notion-style notes). Every canvas node can also open its own page.

- [ ] Page doc type: full-width block editor (new → canvas | page)
- [ ] Block editor, markdown under the hood — no heavy editor framework:
      paragraph · h1/h2/h3 · bullet/numbered · todo · code block (with
      language) · quote · divider · simple table
- [ ] Slash commands (`/code`, `/h2`, `/todo`, …) to insert blocks
- [ ] Node pages: open any box/note/table into its page (side panel);
      export as `### <node>` sections under the diagram
- [ ] Page export = clean md; canvas export unchanged

## Phase 2 — speed & flow

- [ ] Live md split view in the studio (the doc writes itself as you edit)
- [ ] ⌘K palette: commands + search across all docs/pages
- [ ] Tidy button: snap boxes into clean rows/columns
- [ ] Templates on new canvas (layered app · pipeline · data model · blank)
- [ ] Undo/redo, Cmd+D duplicate

## Phase 3 — files

- [ ] Save-to-folder (File System Access API): write the exported md
      straight into a repo's dev_notes/
- [ ] Export whole workspace as a zip of md files

## Deferred (only if it earns it)

- [ ] BYOK AI assist (describe → draft diagram; critique architecture)
- [ ] MD import (parse an existing ARCHITECTURE.md into nodes)
- [ ] Shareable links (URL-compressed diagram)
