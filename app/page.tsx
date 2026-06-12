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
            a block-based markdown studio — notes, todos, code, tables, and
            system diagrams, all in plain .md files you own. no export step:
            what you write is the file.
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
          <h3>write in blocks</h3>
          <p>
            everything renders — headings, code, todos, tables. click a block to
            edit it raw, type / to insert, drag ⋮⋮ to reorder.
          </p>
        </div>
        <div>
          <h3>files are plain markdown</h3>
          <p>
            no export gap, no lock-in. every file reads perfectly on github, in
            any editor, forever — diagrams included, as unicode box art.
          </p>
        </div>
        <div>
          <h3>nothing to set up</h3>
          <p>
            files live in your browser. back up and restore anytime. no accounts,
            no servers, no settings page.
          </p>
        </div>
      </section>

      <footer className="ld-footer">
        <span>sydes — boxes · arrows · markdown</span>
      </footer>
    </main>
  );
}
