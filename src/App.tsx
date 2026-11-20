import { useState } from 'react';
import { MODULES, findMap } from './data/registry';
import { mapHref, useHashRoute } from './hooks/useHashRoute';
import { useTheme } from './hooks/useTheme';
import type { Theme } from './hooks/useTheme';
import MapCanvas from './components/MapCanvas';
import Nav from './components/Nav';
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
          内容整理自党史视频笔记（P1–P5），每张图保留来源章节，便于回查。
        </footer>
      </div>
    </div>
  );
}

function MapPage({
  moduleId,
  subjectId,
  mapId,
  theme,
  onToggle,
}: ThemeProps & { moduleId: string; subjectId: string; mapId: string }) {
  const map = findMap(moduleId, subjectId, mapId);
  const [navOpen, setNavOpen] = useState(false);

  if (!map) return <NotFound />;

  const active = { moduleId, subjectId, mapId };
  const toggle = <ThemeToggle theme={theme} onToggle={onToggle} />;

  return (
    <div className="map-shell">
      <div className="topbar">
        <button
          type="button"
          className="icon-btn"
          aria-label="打开导航"
          onClick={() => setNavOpen(true)}
        >
          ☰
        </button>
        <div className="topbar__title">{map.title}</div>
        {toggle}
      </div>

      <div className="map-body">
        <aside className="sidebar">
          <Nav active={active} themeToggle={toggle} notes={map.notes} />
        </aside>
        <div className="canvas-wrap">
          <MapCanvas map={map} theme={theme} />
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
        theme={theme}
        onToggle={toggle}
      />
    );
  }

  return <NotFound />;
}
