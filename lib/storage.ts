import type { DiagramDoc, DiagramMeta } from "./types";
import { starterDiagram } from "./factory";

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

export function loadDiagram(id: string): DiagramDoc | null {
  if (!canStore()) return null;
  try {
    const raw = localStorage.getItem(docKey(id));
    return raw ? (JSON.parse(raw) as DiagramDoc) : null;
  } catch {
    return null;
  }
}

export function saveDiagram(doc: DiagramDoc) {
  if (!canStore()) return;
  doc.updatedAt = Date.now();
  localStorage.setItem(docKey(doc.id), JSON.stringify(doc));
  const list = listDiagrams().filter((m) => m.id !== doc.id);
  list.unshift({ id: doc.id, name: doc.name, updatedAt: doc.updatedAt });
  writeIndex(list);
  localStorage.setItem(LAST_KEY, doc.id);
}

export function deleteDiagram(id: string) {
  if (!canStore()) return;
  localStorage.removeItem(docKey(id));
  writeIndex(listDiagrams().filter((m) => m.id !== id));
}

/** Last-opened diagram, or a starter one on first visit. */
export function initialDiagram(): DiagramDoc {
  if (!canStore()) return starterDiagram();
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
  const doc = starterDiagram();
  saveDiagram(doc);
  return doc;
}
