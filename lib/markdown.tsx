import React from "react";

/**
 * Tiny markdown renderer for the canvas view mode. Covers exactly what the
 * slash commands can produce (and the usual hand-typed md): headings, bold,
 * italic, inline code, code fences, bullets, numbered lists, todos, quotes,
 * dividers, tables. No HTML, no links-with-scripts — plain, safe rendering.
 */

function inline(text: string): React.ReactNode {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return parts.map((p, i) => {
    if (p.startsWith("`") && p.endsWith("`") && p.length > 2)
      return <code key={i}>{p.slice(1, -1)}</code>;
    if (p.startsWith("**") && p.endsWith("**") && p.length > 4)
      return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("*") && p.endsWith("*") && p.length > 2)
      return <em key={i}>{p.slice(1, -1)}</em>;
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
}

const parseRow = (l: string) =>
  l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());

export function MdView({ md, className }: { md: string; className?: string }) {
  const lines = md.split("\n");
  const out: React.ReactNode[] = [];
  let i = 0;
  let k = 0;

  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();

    if (!t) {
      i++;
      continue;
    }

    // html comment — sydes metadata, invisible in any renderer
    if (t.startsWith("<!--")) {
      while (i < lines.length && !lines[i].includes("-->")) i++;
      i++;
      out.push(
        <div key={k++} className="sy-md-meta" title="sydes data (hidden in the saved file)">
          ⌁
        </div>
      );
      continue;
    }

    // ``` code fence
    if (t.startsWith("```")) {
      const lang = t.slice(3).trim();
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++;
      out.push(
        <pre key={k++} className="sy-md-code">
          {lang && <span className="sy-md-lang">{lang}</span>}
          <code>{buf.join("\n")}</code>
        </pre>
      );
      continue;
    }

    // | table | with separator row
    if (t.startsWith("|") && i + 1 < lines.length && /^\s*\|?[\s\-|:]+\|?\s*$/.test(lines[i + 1]) && lines[i + 1].includes("-")) {
      const rows: string[][] = [parseRow(line)];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(parseRow(lines[i]));
        i++;
      }
      out.push(
        <table key={k++} className="sy-md-table">
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri}>
                {r.map((c, ci) =>
                  ri === 0 ? <th key={ci}>{inline(c)}</th> : <td key={ci}>{inline(c)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      );
      continue;
    }

    // headings
    const h = t.match(/^(#{1,4})\s+(.*)/);
    if (h) {
      const level = h[1].length;
      out.push(
        <div key={k++} className={`sy-md-h sy-md-h${level}`}>
          {inline(h[2])}
        </div>
      );
      i++;
      continue;
    }

    // divider
    if (/^-{3,}$/.test(t)) {
      out.push(<hr key={k++} className="sy-md-hr" />);
      i++;
      continue;
    }

    // todos
    const todo = t.match(/^[-*] \[( |x|X)\] (.*)/);
    if (todo) {
      out.push(
        <div key={k++} className="sy-md-todo">
          <span className={`sy-md-check ${todo[1] !== " " ? "sy-md-done" : ""}`}>
            {todo[1] !== " " ? "✓" : ""}
          </span>
          <span className={todo[1] !== " " ? "sy-md-struck" : ""}>{inline(todo[2])}</span>
        </div>
      );
      i++;
      continue;
    }

    // bullet list
    if (/^[-*] /.test(t)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i].trim()) && !/^[-*] \[/.test(lines[i].trim())) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      out.push(
        <ul key={k++} className="sy-md-ul">
          {items.map((it, ii) => (
            <li key={ii}>{inline(it)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // numbered list
    if (/^\d+\. /.test(t)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\. /, ""));
        i++;
      }
      out.push(
        <ol key={k++} className="sy-md-ol">
          {items.map((it, ii) => (
            <li key={ii}>{inline(it)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // quote
    if (t.startsWith("> ")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        buf.push(lines[i].trim().slice(2));
        i++;
      }
      out.push(
        <blockquote key={k++} className="sy-md-quote">
          {buf.map((b, bi) => (
            <div key={bi}>{inline(b)}</div>
          ))}
        </blockquote>
      );
      continue;
    }

    // paragraph
    out.push(
      <p key={k++} className="sy-md-p">
        {inline(t)}
      </p>
    );
    i++;
  }

  if (!out.length)
    return <div className={`sy-md sy-md-empty ${className ?? ""}`}>✎</div>;
  return <div className={`sy-md ${className ?? ""}`}>{out}</div>;
}
