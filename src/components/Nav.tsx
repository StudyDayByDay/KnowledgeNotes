import { Fragment, type ReactNode } from 'react';
import { MODULES } from '../data/registry';
import type { MapNote } from '../data/types';
import { mapHref } from '../hooks/useHashRoute';

interface NavProps {
  active?: { moduleId: string; subjectId: string; mapId: string };
  onNavigate?: () => void;
  themeToggle: ReactNode;
  notes?: MapNote[];
}

const NOTE_TAG: Record<MapNote['kind'], string> = {
  warning: '易混',
  mnemonic: '口诀',
  tip: '技巧',
};

export default function Nav({ active, onNavigate, themeToggle, notes }: NavProps) {
  return (
    <nav aria-label="知识图谱导航">
      <div className="sidebar__brand">
        <a href="#/" onClick={onNavigate}>
          KnowledgeNotes
        </a>
        {themeToggle}
      </div>

      {MODULES.map((module) => (
        <div key={module.id}>
          <div className="nav-subject">{module.title}</div>
          {module.subjects.length === 0 ? (
            <div className="nav-empty">{module.note ?? '待接入'}</div>
          ) : (
            module.subjects.map((subject) => {
              const linkFor = (map: (typeof subject.maps)[number]) => {
                const isActive =
                  active?.moduleId === module.id &&
                  active.subjectId === subject.id &&
                  active.mapId === map.id;
                return (
                  <a
                    key={map.id}
                    href={mapHref(module.id, subject.id, map.id)}
                    className={`nav-map ${isActive ? 'is-active' : ''}`}
                    onClick={onNavigate}
                  >
                    {map.title}
                  </a>
                );
              };

              // 单图科目不再重复“科目名 + 图名”两行，直接一个入口
              if (subject.maps.length === 1) {
                return (
                  <Fragment key={subject.id}>{linkFor(subject.maps[0])}</Fragment>
                );
              }

              return (
                <div key={subject.id}>
                  <div className="nav-sub-title">{subject.title}</div>
                  {subject.maps.map(linkFor)}
                </div>
              );
            })
          )}
        </div>
      ))}

      {notes && notes.length > 0 ? (
        <div className="side-notes">
          <div className="side-notes__title">图注</div>
          {notes.map((note, i) => (
            <div key={i} className={`notes__row notes__row--${note.kind}`}>
              <span className={`notes__tag notes__tag--${note.kind}`}>
                {NOTE_TAG[note.kind]}
              </span>
              <span>{note.text}</span>
            </div>
          ))}
        </div>
      ) : null}
    </nav>
  );
}
