import { useMemo, useState } from 'react';
import { hrefForHit, searchAll } from '../data/search';
import { KIND_LABEL } from '../data/types';

interface SearchBoxProps {
  onNavigate?: () => void;
  autoFocus?: boolean;
}

export default function SearchBox({ onNavigate, autoFocus }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const hits = useMemo(() => searchAll(query), [query]);

  const go = (href: string) => {
    onNavigate?.();
    window.location.hash = href.replace(/^#/, '');
  };

  return (
    <div className="search">
      <input
        className="search__input"
        type="search"
        value={query}
        autoFocus={autoFocus}
        placeholder="搜考点 / 图名，如：遵义、增长率"
        aria-label="搜索知识图谱"
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && hits[0]) go(hrefForHit(hits[0]));
          if (e.key === 'Escape') setQuery('');
        }}
      />
      {query.trim() ? (
        <div className="search__results">
          {hits.length === 0 ? (
            <div className="search__empty">没有找到「{query.trim()}」</div>
          ) : (
            hits.map((hit) => {
              const key = `${hit.moduleId}/${hit.subjectId}/${hit.mapId}/${hit.nodeId ?? 'map'}`;
              return (
                <button
                  key={key}
                  type="button"
                  className="search__hit"
                  onClick={() => go(hrefForHit(hit))}
                >
                  <span className="search__hit-label">{hit.label}</span>
                  <span className="search__hit-meta">
                    {hit.isMap ? '图' : KIND_LABEL[hit.kind ?? 'concept']} ·{' '}
                    {hit.subjectTitle} · {hit.mapTitle}
                  </span>
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
