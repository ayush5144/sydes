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
      always-faintly-visible handles

## Phase 1 — polish (next)

- [ ] Starter templates (layered web app · pipeline · data model)
- [ ] Cmd+D duplicate node
- [ ] Undo/redo (React Flow history)
- [ ] Multi-select alignment helpers (align lefts / distribute)
- [ ] Export: option to include a Mermaid block alongside ascii
- [ ] Drawn-label fallback: when a label can't be placed in the ascii,
      list it under Connections instead of dropping it
- [ ] Mobile: read-only viewer at minimum

## Phase 2 — maybe (only if it earns it)

- [ ] MD import (parse an existing ARCHITECTURE.md into nodes)
- [ ] Shareable links (URL-compressed diagram)
- [ ] Deploy to Vercel + domain
