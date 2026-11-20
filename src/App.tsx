import { useEffect, useRef, useState } from 'react';
import { MODULES, findMap } from './data/registry';
import { mapHref, useHashRoute } from './hooks/useHashRoute';
import { goBack } from './hooks/useBack';
import { useTheme } from './hooks/useTheme';
import type { Theme } from './hooks/useTheme';
import MapCanvas from './components/MapCanvas';
import Nav from './components/Nav';
import DailyReview from './components/DailyReview';
import SearchBox from './components/SearchBox';
import ThemeToggle from './components/ThemeToggle';

interface ThemeProps {
  theme: Theme;
  onToggle: () => void;
}

function Home({ theme, onToggle }: ThemeProps) {
  const activeModules = MODULES.filter((m) => m.subjects.length > 0);
  const pendingModules = MODULES.filter((m) => m.subjects.length === 0);

  return (
    <div className="home">
      <div className="home-inner">
        <header className="home-top">
          <div>
            <h1 className="home-title">行测知识图谱</h1>
            <p className="home-sub">
              把文字笔记重新组织成可放大的大图：颜色区分语义，箭头表达关系。
              手机随时打开，反复看，把知识点和它们之间的联系记熟。
            </p>
          </div>
          <ThemeToggle theme={theme} onToggle={onToggle} />
        </header>

        <div className="home-search">
          <SearchBox />
        </div>

        <DailyReview />

        {activeModules.map((module) => (
          <section className="module-block" key={module.id}>
            <div className="module-head">
              <h2>{module.title}</h2>
            </div>

            {module.subjects.map((subject) => (
              <div key={subject.id} style={{ marginBottom: 18 }}>
                <div className="module-head module-head--sub">
                  <h2>{subject.title}</h2>
                  <span>{subject.maps.length} 张图</span>
                </div>
                <div className="card-grid">
                  {subject.maps.map((map) => (
                    <a
                      key={map.id}
                      className="map-card"
                      href={mapHref(module.id, subject.id, map.id)}
                    >
                      <div className="map-card__kicker">
                        {module.title} · {subject.title}
                      </div>
                      <div className="map-card__title">{map.title}</div>
                      {map.subtitle ? (
                        <div className="map-card__desc">{map.subtitle}</div>
                      ) : null}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}

        {pendingModules.length > 0 ? (
          <div className="pending-line">
            其他科目：{pendingModules.map((m) => m.title).join('、')} —— 待接入
          </div>
        ) : null}

        <footer style={{ color: 'var(--muted)', fontSize: 12, marginTop: 28 }}>
          内容整理自行测各科视频笔记，每张图保留来源章节（refs），便于回查。
        </footer>
      </div>
    </div>
  );
}

function MapPage({
  moduleId,
  subjectId,
  mapId,
  focusNode,
  theme,
  onToggle,
}: ThemeProps & {
  moduleId: string;
  subjectId: string;
  mapId: string;
  focusNode?: string;
}) {
  const map = findMap(moduleId, subjectId, mapId);
  const [navOpen, setNavOpen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);

  // iOS 主屏幕模式没有 Safari 的边缘滑动返回，这里在左边缘补一个
  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (!standalone) return;

    const el = shellRef.current;
    if (!el) return;
    let start: { x: number; y: number } | null = null;

    const onStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      start =
        touch && touch.clientX < 28 ? { x: touch.clientX, y: touch.clientY } : null;
    };
    const onEnd = (event: TouchEvent) => {
      const origin = start;
      start = null;
      if (!origin) return;
      const touch = event.changedTouches[0];
      if (touch && touch.clientX - origin.x > 80 && Math.abs(touch.clientY - origin.y) < 60) {
        goBack();
      }
    };

    el.addEventListener('touchstart', onStart, { capture: true, passive: true });
    el.addEventListener('touchend', onEnd, { capture: true, passive: true });
    return () => {
      el.removeEventListener('touchstart', onStart, { capture: true });
      el.removeEventListener('touchend', onEnd, { capture: true });
    };
  }, []);

  if (!map) return <NotFound />;

  const active = { moduleId, subjectId, mapId };
  const toggle = <ThemeToggle theme={theme} onToggle={onToggle} />;

  return (
    <div className="map-shell" ref={shellRef}>
      <div className="topbar">
        <button
          type="button"
          className="icon-btn"
          aria-label="返回"
          onClick={goBack}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M15 5 8 12l7 7"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label="打开导航"
          onClick={() => setNavOpen(true)}
        >
          ☰
        </button>
        <div className="topbar__title">{map.title}</div>
        <button
          type="button"
          className="icon-btn"
          aria-label="搜索"
          onClick={() => setNavOpen(true)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.8" />
            <path d="M15.5 15.5 20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        {toggle}
      </div>

      <div className="map-body">
        <aside className="sidebar">
          <Nav active={active} themeToggle={toggle} notes={map.notes} />
        </aside>
        <div className="canvas-wrap">
          <MapCanvas map={map} theme={theme} focusNode={focusNode} />
        </div>
      </div>

      {navOpen ? (
        <>
          <div className="drawer-mask" onClick={() => setNavOpen(false)} />
          <div className="drawer">
            <Nav
              active={active}
              onNavigate={() => setNavOpen(false)}
              themeToggle={toggle}
              notes={map.notes}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

function NotFound() {
  return (
    <div className="home">
      <div className="home-inner">
        <h1 className="home-title">没有找到这张图</h1>
        <p className="home-sub">
          链接可能写错了，或者这张图还没做。<a href="#/">回到首页</a>
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const route = useHashRoute();
  const { theme, toggle } = useTheme();

  if (route.kind === 'home') {
    return <Home theme={theme} onToggle={toggle} />;
  }

  if (route.kind === 'map') {
    return (
      <MapPage
        moduleId={route.moduleId}
        subjectId={route.subjectId}
        mapId={route.mapId}
        focusNode={route.focusNode}
        theme={theme}
        onToggle={toggle}
      />
    );
  }

  return <NotFound />;
}
