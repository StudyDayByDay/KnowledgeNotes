import { MODULES } from './registry';
import type { NodeKind } from './types';

export interface SearchHit {
  moduleId: string;
  moduleTitle: string;
  subjectId: string;
  subjectTitle: string;
  mapId: string;
  mapTitle: string;
  nodeId?: string;
  label: string;
  summary?: string;
  kind?: NodeKind;
  refs?: string[];
  isMap: boolean;
}

let cache: SearchHit[] | null = null;

export function getSearchIndex(): SearchHit[] {
  if (cache) return cache;
  const hits: SearchHit[] = [];
  for (const mod of MODULES) {
    for (const subject of mod.subjects) {
      for (const map of subject.maps) {
        hits.push({
          moduleId: mod.id,
          moduleTitle: mod.title,
          subjectId: subject.id,
          subjectTitle: subject.title,
          mapId: map.id,
          mapTitle: map.title,
          label: map.title,
          summary: map.subtitle,
          isMap: true,
        });
        for (const node of map.nodes) {
          hits.push({
            moduleId: mod.id,
            moduleTitle: mod.title,
            subjectId: subject.id,
            subjectTitle: subject.title,
            mapId: map.id,
            mapTitle: map.title,
            nodeId: node.id,
            label: node.label,
            summary: node.summary,
            kind: node.kind,
            refs: node.refs,
            isMap: false,
          });
        }
      }
    }
  }
  cache = hits;
  return hits;
}

export function searchAll(query: string): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const scored = getSearchIndex()
    .map((hit) => {
      const label = hit.label.toLowerCase();
      let score = 0;
      if (label === q) score += 12;
      else if (label.startsWith(q)) score += 8;
      else if (label.includes(q)) score += 5;

      if (hit.summary?.toLowerCase().includes(q)) score += 2;
      if (hit.mapTitle.toLowerCase().includes(q)) score += hit.isMap ? 4 : 1;
      if (hit.subjectTitle.toLowerCase().includes(q)) score += 1;
      if (hit.moduleTitle.toLowerCase().includes(q)) score += 1;
      if (hit.refs?.some((r) => r.toLowerCase().includes(q))) score += 1;

      return { hit, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.hit.label.length - b.hit.label.length);

  return scored.slice(0, 30).map((x) => x.hit);
}

export function hrefForHit(hit: SearchHit): string {
  const base = `#/m/${hit.moduleId}/${hit.subjectId}/${hit.mapId}`;
  return hit.nodeId ? `${base}?node=${encodeURIComponent(hit.nodeId)}` : base;
}
