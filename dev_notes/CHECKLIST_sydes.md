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
