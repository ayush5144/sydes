/**
 * Block model for the document editor. The markdown string is the single
 * source of truth; this splits it into editable blocks and joins it back.
 * Re-parsing after every commit means a block edited to contain a blank
 * line naturally becomes two blocks, and an emptied block disappears.
 */

const isFence = (l: string) => l.trim().startsWith("```");
const isTable = (l: string) => l.trim().startsWith("|");
const isListy = (l: string) =>
  /^(\s*)([-*] |\d+\. |> )/.test(l) && !/^\s*-{3,}\s*$/.test(l);
const isHeading = (l: string) => /^#{1,6} /.test(l.trim());
const isDivider = (l: string) => /^-{3,}$/.test(l.trim());
const isComment = (l: string) => l.trim().startsWith("<!--");
const isStructural = (l: string) =>
  isFence(l) || isTable(l) || isListy(l) || isHeading(l) || isDivider(l) || isComment(l);

export function parseBlocks(md: string): string[] {
  const lines = md.split("\n");
  const blocks: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (isFence(line)) {
      const buf = [line];
      i++;
      while (i < lines.length && !isFence(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      if (i < lines.length) {
        buf.push(lines[i]);
        i++;
      }
      blocks.push(buf.join("\n"));
      continue;
    }
    if (isComment(line)) {
      const buf = [line];
      while (i < lines.length && !lines[i].includes("-->")) {
        i++;
        if (i < lines.length && !buf.includes(lines[i])) buf.push(lines[i]);
      }
      if (i < lines.length && !buf[buf.length - 1].includes("-->")) buf.push(lines[i]);
      i++;
      blocks.push(buf.join("\n"));
      continue;
    }
    if (isTable(line)) {
      const buf: string[] = [];
      while (i < lines.length && isTable(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      blocks.push(buf.join("\n"));
      continue;
    }
    if (isHeading(line) || isDivider(line)) {
      blocks.push(line.trim());
      i++;
      continue;
    }
    if (isListy(line)) {
      const buf: string[] = [];
      while (i < lines.length && isListy(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      blocks.push(buf.join("\n"));
      continue;
    }
    // paragraph: consecutive plain lines
    const buf: string[] = [];
    while (i < lines.length && lines[i].trim() && !isStructural(lines[i])) {
      buf.push(lines[i]);
      i++;
    }
    blocks.push(buf.join("\n"));
  }
  return blocks;
}

export const serializeBlocks = (blocks: string[]): string =>
  blocks.filter((b) => b.trim()).join("\n\n") + "\n";

export const STARTER_MD = `# welcome to sydes

your markdown studio — every file here is a plain .md you own. no export
step, no lock-in: what you write is the file.

- click any block to edit it raw — click away and it renders
- type / on a new line for blocks: heading, code, todo, table…
- drag the ⋮⋮ handle to reorder blocks
- press enter in a list and it continues; enter on an empty item ends it

## try things

- [ ] make a todo
- [x] render markdown properly

\`\`\`ts
const sydes = "pure markdown";
\`\`\`

| feature | status |
| --- | --- |
| blocks | live |
| flow diagrams | next |
`;
