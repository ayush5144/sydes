# sydes v2 — markdown-first (the locked direction)

*Decided 12 June 2026. "Excalidraw for Markdown."*

## The pivot

sydes is an **editable markdown system**, not a canvas tool. A sydes file IS a
`.md` document. There is no export gap: what you edit is what you own.

The canvas was v1's front door; in v2 it survives only as a **block inside a
document** (the diagram block). The document is the product.

## The model

A document = a vertical stack of **blocks**, parsed from / serialized to plain
markdown 1:1:

| Block | Edited as | Stored as |
|---|---|---|
| paragraph / heading / quote / divider | text (per-block editor) | plain md |
| bullet · numbered · todo list | text with Enter-continuation | plain md |
| code | code editor with language tag | fenced block |
| **table** | the rich grid editor (click cells, +row/+col) | md table |
| **diagram** | the drag-canvas in a focused editor (boxes, arrows, layers) | ascii code block + JSON in an html comment for lossless round-trip |

Drag-and-drop in a document = **block reordering** (⋮⋮ handle, drag up/down).
Tables drag as whole blocks. 2D positioning only exists inside a diagram block.

## Editing experience

Obsidian-live-preview style, per block: everything renders (MdView); click a
block to edit just that block raw (MdArea); click away → renders again.
Slash commands insert blocks. Enter continues lists. The whole doc is never
one giant textarea.

## What carries over (already built)

MdArea (slash commands + list continuation) · MdView (renderer) · TableGrid ·
the entire canvas stack (becomes the diagram-block editor) · storage/files ·
search · export modal (becomes trivial: the file itself).

## Phases

**A — the document (new default).**
New file = document. Block stack, click-to-edit-per-block, slash inserts,
⋮⋮ drag-reorder, table blocks use TableGrid, copy/download = the raw file.
Canvas files still open as before (legacy, untouched).

**B — the diagram block.**
`/diagram` inserts a block → opens the drag-canvas in a modal → on close,
serializes ascii + `<!-- sydes:diagram {json} -->`. Reopen = fully editable.
"Convert canvas → document" migration (runs the exporter once, embeds JSON).
After this, new canvases are no longer offered; the canvas type is retired.

**C — the brain.**
`[[links]]` between files (type `[[` → file picker; missing file = create).
Search across all files. Save-to-folder (File System Access) → a repo's
dev_notes/ writes itself. Zip export of the workspace.

## Rules (inherit + extend the locked decisions)

- The md file is the single source of truth. Every block must round-trip.
- Diagram JSON lives in an html comment so the file stays readable on GitHub.
- No WYSIWYG framework; per-block raw editing keeps the surface small.
- Still: no backend, no accounts, no settings page.
