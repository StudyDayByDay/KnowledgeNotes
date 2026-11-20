import { useState } from 'react';
import { KIND_LABEL, type NodeKind } from '../data/types';
import { KIND_TONE } from '../styles/tones';

interface LegendProps {
  kinds: NodeKind[];
}

export default function Legend({ kinds }: LegendProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="legend-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        图例
      </button>
      <div className={`legend ${open ? 'is-open' : ''}`}>
        <div className="legend__title">图例</div>
        {kinds.map((kind) => (
          <div key={kind} className="legend__row">
            <span className="legend__dot" style={{ background: KIND_TONE[kind] }} />
            {KIND_LABEL[kind]}
          </div>
        ))}
        <div className="legend__row">
          <span className="legend__line" />
          时间 / 演进
        </div>
        <div className="legend__row">
          <span className="legend__line legend__line--contrast" />
          易混对比
        </div>
      </div>
    </>
  );
}
