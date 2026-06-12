# sydes

**design systems in plain sight.**

A visual studio for system design and structured notes — drag boxes, connect
flows, group layers, sketch tables and notes — then export the whole thing as
clean markdown with unicode box diagrams:

```
┌─────────────────────────┐
│         WEB UI          │
└────────────┬────────────┘
             │ HTTPS
             ▼
┌─────────────────────────┐
│        API LAYER        │
└────────────┬────────────┘
       ┌─────┴──────┐
       ▼            ▼
┌────────────┐ ┌────────────┐
│  POSTGRES  │ │ JOB QUEUE  │
└────────────┘ └────────────┘
```

No backend, no accounts. Diagrams live in localStorage, with json backup/import.

## Stack

Next.js (App Router) · React · Tailwind · [@xyflow/react](https://reactflow.dev).
Both routes are fully static.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
```

Verify: `npx tsc --noEmit && npm run lint && npm run build`

## Deploy

Zero config on Vercel — import the repo, framework preset "Next.js", done.
No environment variables needed.

## Docs

- `dev_notes/ARCHITECTURE_sydes.md` — how it's built, exporter algorithm
- `dev_notes/CHECKLIST_sydes.md` — what's done, what's next
