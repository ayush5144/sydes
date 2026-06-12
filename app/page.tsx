import Link from "next/link";

const SAMPLE = `┌─────────────────────────┐
│         WEB UI          │
│  canvas · palette       │
└────────────┬────────────┘
             │ HTTPS
             ▼
┌─────────────────────────┐
│        API LAYER        │
│  auth · crud · enqueue  │
└────────────┬────────────┘
       ┌─────┴──────┐
       ▼            ▼
┌────────────┐ ┌────────────┐
│  POSTGRES  │ │ JOB QUEUE  │
└────────────┘ └────────────┘`;

export default function Home() {
  return (
    <main className="ld">
      <nav className="ld-nav">
        <span className="ld-mark">sydes</span>
        <Link href="/studio" className="ld-navlink">
          open studio →
        </Link>
      </nav>

      <section className="ld-hero">
        <div className="ld-hero-text">
          <h1>
            design systems
            <br />
            in plain sight.
          </h1>
          <p>
            a visual studio for system design — drag boxes, connect flows, group
            layers, sketch tables and notes. then export the whole thing as clean
            markdown with hand-crafted ascii diagrams.
          </p>
          <div className="ld-cta">
            <Link href="/studio" className="ld-btn">
              start designing
            </Link>
            <span className="ld-cta-note">free · no account · saves in your browser</span>
          </div>
        </div>
        <pre className="ld-sample" aria-hidden>
          {SAMPLE}
        </pre>
      </section>

      <section className="ld-features">
        <div>
          <h3>think on a canvas</h3>
          <p>
            boxes, notes, tables, layers. vertical stacks or horizontal pipelines —
            connect anything to anything, label every arrow.
          </p>
        </div>
        <div>
          <h3>export real markdown</h3>
          <p>
            one click turns your canvas into an ARCHITECTURE.md — unicode box
            diagrams, markdown tables, notes. readable in any editor, forever.
          </p>
        </div>
        <div>
          <h3>nothing to set up</h3>
          <p>
            diagrams live in localStorage. back up and restore as json. no accounts,
            no servers, no lock-in.
          </p>
        </div>
      </section>

      <footer className="ld-footer">
        <span>sydes — boxes · arrows · markdown</span>
      </footer>
    </main>
  );
}
