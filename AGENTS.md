# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# sydes

Visual system-design studio → exports markdown with ascii box diagrams.
Read `dev_notes/ARCHITECTURE_sydes.md` first; current state in `dev_notes/CHECKLIST_sydes.md`.

Rules:
- The export is the product — every canvas feature must survive the round trip to readable md.
- No backend, no accounts. localStorage only.
- Undrawable edges go to the Connections list, never mangled into the ascii.
- Verify with `npx tsc --noEmit && npm run build`.
