import type { DiagramMeta, SydesFile } from "./types";
import { STARTER_MD } from "./blocks";
import { uid } from "./factory";

const INDEX_KEY = "sydes:index";
const LAST_KEY = "sydes:last";
const docKey = (id: string) => `sydes:d:${id}`;

const canStore = () => typeof window !== "undefined" && !!window.localStorage;

export function listDiagrams(): DiagramMeta[] {
  if (!canStore()) return [];
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    const list = raw ? (JSON.parse(raw) as DiagramMeta[]) : [];
    return list.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

function writeIndex(list: DiagramMeta[]) {
  localStorage.setItem(INDEX_KEY, JSON.stringify(list));
}

export function loadDiagram(id: string): SydesFile | null {
  if (!canStore()) return null;
  try {
    const raw = localStorage.getItem(docKey(id));
    if (!raw) return null;
    const file = JSON.parse(raw) as SydesFile;
    if (!file.kind) file.kind = "canvas"; // files predating the md pivot
    return file;
  } catch {
    return null;
  }
}

export function saveDiagram(doc: SydesFile) {
  if (!canStore()) return;
  doc.updatedAt = Date.now();
  localStorage.setItem(docKey(doc.id), JSON.stringify(doc));
  const list = listDiagrams().filter((m) => m.id !== doc.id);
  list.unshift({ id: doc.id, name: doc.name, kind: doc.kind, updatedAt: doc.updatedAt });
  writeIndex(list);
  localStorage.setItem(LAST_KEY, doc.id);
}

export function deleteDiagram(id: string) {
  if (!canStore()) return;
  localStorage.removeItem(docKey(id));
  writeIndex(listDiagrams().filter((m) => m.id !== id));
}

export function blankMdFile(name = "untitled"): SydesFile {
  // every file starts the same way: a heading, like a notion page
  return { id: `d-${uid()}`, name, kind: "md", content: `# ${name}\n`, updatedAt: Date.now() };
}

function starterMdFile(): SydesFile {
  return {
    id: `d-${uid()}`,
    name: "welcome",
    kind: "md",
    content: STARTER_MD,
    updatedAt: Date.now(),
  };
}

/** Last-opened file, or the welcome doc on first visit. */
export function initialDiagram(): SydesFile {
  if (!canStore()) return starterMdFile();
  const last = localStorage.getItem(LAST_KEY);
  if (last) {
    const doc = loadDiagram(last);
    if (doc) return doc;
  }
  const list = listDiagrams();
  if (list.length) {
    const doc = loadDiagram(list[0].id);
    if (doc) return doc;
  }
  const doc = starterMdFile();
  saveDiagram(doc);
  return doc;
}
