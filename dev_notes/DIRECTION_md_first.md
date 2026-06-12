# sydes v2 — pure markdown (the locked direction)

*Decided 12 June 2026. No canvas. The .md file is the app.*

## What sydes is now

A **block-based markdown studio**. One file type: a markdown document.
What you edit is byte-for-byte what you own — there is no export step that
can be imperfect, because the document IS the export.

Pitch: *write docs that render their own diagrams.*

## The model

A document = markdown string (single source of truth), displayed as a stack
of blocks. Everything renders pretty; **click a block to edit just that block
raw; click away → renders again** (per-block live preview, Obsidian-style,
no WYSIWYG framework).

| Block | Edit experience | Stored as |
|---|---|---|
| paragraph · h1–h4 · quote · divider | per-block text editor | plain md |
| bullet · numbered · todo | Enter-continuation (already built) | plain md |
| code | editor + language tag | fenced block |
| **table** | the rich grid (click cells, +row/+col, +note) | md table |
| **flow** | *the new thing — see below* | ascii diagram + source comment |

Drag-and-drop = **block reordering** (⋮⋮ handle). Slash commands insert
blocks. `/` menu: h2, h3, bullet, todo, code, quote, divider, table, flow.

## ⚠ OPEN QUESTION — flow block not yet approved

Ayush has not fully bought into / understood the text-defined flow block
below (12 June 2026). Before building Phase B, demo it on real examples and
re-decide. Alternatives if text-flows don't feel right: (a) a mini drag
canvas scoped inside a flow block (Excalidraw-style embed), or (b) both —
type arrows OR drag, same block. Do not build B until this is settled.

## The flow block — diagrams with zero canvas (PROPOSED)

You don't drag boxes. You *write* the flow, sydes draws it:

    /flow
    web ui -> api: HTTPS
    api -> postgres: writes
    api -> queue: enqueues
    queue -> workers
    api: auth · crud · enqueue        <- optional detail line for a node

Live preview renders the unicode box diagram **using the layout engine we
already built** (lib/export.ts: rows from topology instead of y-positions —
sources above targets, siblings side by side, fan-out junctions, labels).

Saved in the file as the rendered ascii in a plain code fence — perfectly
readable on GitHub/anywhere — with the source lines in an html comment below
it, so reopening in sydes is fully editable. Lossless round trip:

    ```
    ┌────────┐
    │ WEB UI │ ...
    ```
    <!-- sydes:flow
    web ui -> api: HTTPS
    ... -->

This is faster than dragging for 90% of architecture diagrams, and it is
pure text end to end. If real 2D placement is ever missed, a visual editor
for the flow block can return later as an *option* — not as the product.

## What carries over

MdArea (slash + list continuation) · MdView (renderer) · TableGrid ·
the ascii layout engine · storage/files · search (becomes cross-file) ·
landing page (new copy). **React Flow and all canvas UI get deleted** —
the app gets dramatically lighter.

## Migration

Existing canvas files: one-time convert via the current exporter → they
become documents (diagram lands as a flow block with reconstructed source
from nodes/edges). Then the canvas code is removed entirely.

## Phases

**A — the document editor.** Block stack on the md string, per-block
edit/render, slash inserts, ⋮⋮ reorder, files menu, copy/download.
**B — the rich blocks.** Table block (grid editor) · flow block (parser,
topology layout, live ascii preview).
**C — cleanup + brain.** Canvas → document migration, delete React Flow,
[[links]] between files, cross-file search, save-to-folder, zip export.

## Rules

- The md string is the single source of truth; every block round-trips.
- The saved file must read perfectly in any editor — sydes magic lives in
  html comments, never in syntax other tools choke on.
- No backend, no accounts, no settings page. Still localStorage + json/md.
- Keep it clean: if a feature can't be a block, it doesn't exist.
