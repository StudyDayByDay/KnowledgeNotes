import { useEffect, useMemo, useState } from 'react';
import { dailyPicks, mapKey, todayKey } from '../data/daily';
import { mapHref } from '../hooks/useHashRoute';

const storageKey = (date: string) => `kn-daily-${date}`;

function readDone(date: string): string[] {
  try {
    const raw = localStorage.getItem(storageKey(date));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export default function DailyReview() {
  const date = todayKey();
  const [salt, setSalt] = useState(0);
  const [done, setDone] = useState<string[]>(() => readDone(date));
  const picks = useMemo(() => dailyPicks(date, 3, salt), [date, salt]);

  useEffect(() => {
    setDone(readDone(date));
  }, [date]);

  const toggle = (key: string) => {
    const next = done.includes(key) ? done.filter((k) => k !== key) : [...done, key];
    setDone(next);
    try {
      localStorage.setItem(storageKey(date), JSON.stringify(next));
    } catch {
      /* localStorage 不可用时忽略 */
    }
  };

  const allDone = picks.length > 0 && picks.every((p) => done.includes(mapKey(p)));

  return (
    <section className="daily">
      <div className="daily__head">
        <div>
          <h2>今日轮看</h2>
          <span>{date} · 每天 3 张，先看结构，再回忆节点</span>
        </div>
        <button type="button" className="daily__shuffle" onClick={() => setSalt((s) => s + 1)}>
          换一组
        </button>
      </div>

      <div className="daily__grid">
        {picks.map((pick) => {
          const key = mapKey(pick);
          const isDone = done.includes(key);
          return (
            <div className={`daily-card ${isDone ? 'is-done' : ''}`} key={key}>
              <a
                href={mapHref(pick.moduleId, pick.subjectId, pick.mapId)}
                className="daily-card__link"
              >
                <span className="daily-card__kicker">
                  {pick.moduleTitle} · {pick.subjectTitle}
                </span>
                <span className="daily-card__title">{pick.mapTitle}</span>
                {pick.subtitle ? (
                  <span className="daily-card__sub">{pick.subtitle}</span>
                ) : null}
              </a>
              <button
                type="button"
                className={`daily-card__check ${isDone ? 'is-done' : ''}`}
                onClick={() => toggle(key)}
              >
                {isDone ? '✓ 看过了' : '标记看过'}
              </button>
            </div>
          );
        })}
      </div>

      {allDone ? (
        <div className="daily__done">今天的 3 张都看完了。想加练可以点「换一组」。</div>
      ) : null}
    </section>
  );
}
