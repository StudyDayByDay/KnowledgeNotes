import { useEffect, useMemo, useState } from 'react';

export type Route =
  | { kind: 'home' }
  | {
      kind: 'map';
      moduleId: string;
      subjectId: string;
      mapId: string;
      focusNode?: string;
    }
  | { kind: 'unknown' };

function parseHash(hash: string): Route {
  const raw = hash.replace(/^#/, '');
  if (raw === '' || raw === '/') return { kind: 'home' };

  const [path, query = ''] = raw.split('?');
  const match = path.match(/^\/m\/([\w-]+)\/([\w-]+)\/([\w-]+)$/);
  if (match) {
    const params = new URLSearchParams(query);
    return {
      kind: 'map',
      moduleId: match[1],
      subjectId: match[2],
      mapId: match[3],
      focusNode: params.get('node') ?? undefined,
    };
  }
  return { kind: 'unknown' };
}

export function useHashRoute(): Route {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return useMemo(() => parseHash(hash), [hash]);
}

export function mapHref(moduleId: string, subjectId: string, mapId: string): string {
  return `#/m/${moduleId}/${subjectId}/${mapId}`;
}
