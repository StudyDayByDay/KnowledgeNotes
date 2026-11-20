import { MODULES } from './registry';

export interface FlatMap {
  moduleId: string;
  moduleTitle: string;
  subjectId: string;
  subjectTitle: string;
  mapId: string;
  mapTitle: string;
  subtitle?: string;
}

export const ALL_MAPS: FlatMap[] = MODULES.flatMap((mod) =>
  mod.subjects.flatMap((subject) =>
    subject.maps.map((map) => ({
      moduleId: mod.id,
      moduleTitle: mod.title,
      subjectId: subject.id,
      subjectTitle: subject.title,
      mapId: map.id,
      mapTitle: map.title,
      subtitle: map.subtitle,
    })),
  ),
);

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function hashString(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** 同一天、同一 salt 得到同一组图；“换一组”只改 salt。 */
export function dailyPicks(dateKey: string, count = 3, salt = 0): FlatMap[] {
  if (ALL_MAPS.length === 0) return [];
  const picks: FlatMap[] = [];
  const used = new Set<number>();
  let state = hashString(`${dateKey}:${salt}`) || 1;

  while (picks.length < Math.min(count, ALL_MAPS.length)) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const index = state % ALL_MAPS.length;
    if (!used.has(index)) {
      used.add(index);
      picks.push(ALL_MAPS[index]);
    }
  }
  return picks;
}

export function mapKey(m: FlatMap): string {
  return `${m.moduleId}/${m.subjectId}/${m.mapId}`;
}
