import { useEffect, useState } from 'react';
import {
  EDGE_LABEL,
  KIND_LABEL,
  type KnowledgeMap,
  type KnowledgeNode,
} from '../data/types';
import { KIND_TONE } from '../styles/tones';

interface NodePanelProps {
  node: KnowledgeNode;
  map: KnowledgeMap;
  quizMode: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
}

export default function NodePanel({
  node,
  map,
  quizMode,
  onClose,
  onSelect,
}: NodePanelProps) {
  const [revealed, setRevealed] = useState(!quizMode);

  useEffect(() => {
    setRevealed(!quizMode);
  }, [quizMode, node.id]);

  const outgoing = map.edges.filter((e) => e.source === node.id);
  const incoming = map.edges.filter((e) => e.target === node.id);
  const labelOf = (id: string) => map.nodes.find((n) => n.id === id)?.label ?? id;

  return (
    <aside className="node-panel" aria-label="节点详情">
      <div className="node-panel__head">
        <span
          className="node-panel__kind"
          style={{
            color: KIND_TONE[node.kind],
            background: `color-mix(in srgb, ${KIND_TONE[node.kind]} 14%, transparent)`,
          }}
        >
          {KIND_LABEL[node.kind]}
        </span>
        <button type="button" className="node-panel__close" onClick={onClose} aria-label="关闭">
          ×
        </button>
      </div>

      <h2 className="node-panel__title">{node.label}</h2>
      {node.sub ? <div className="node-panel__sub">{node.sub}</div> : null}

      <div className="node-panel__answer">
        {revealed ? (
          <p>{node.summary ?? '这张图没有写一句话考点。'}</p>
        ) : (
          <button type="button" className="node-panel__reveal" onClick={() => setRevealed(true)}>
            先自己回忆，点这里看答案
          </button>
        )}
      </div>

      {revealed && node.refs && node.refs.length > 0 ? (
        <div className="node-panel__refs">来源：{node.refs.join('、')}</div>
      ) : null}
      {incoming.length > 0 ? (
        <div className="node-panel__rels">
          <div className="node-panel__rels-title">来自</div>
          {incoming.map((edge) => (
            <button
              type="button"
              key={edge.id}
              className="node-panel__rel"
              onClick={() => onSelect(edge.source)}
            >
              <span className="node-panel__rel-name">{labelOf(edge.source)}</span>
              <span className="node-panel__rel-kind">{edge.label ?? EDGE_LABEL[edge.kind]}</span>
            </button>
          ))}
        </div>
      ) : null}

      {outgoing.length > 0 ? (
        <div className="node-panel__rels">
          <div className="node-panel__rels-title">指向</div>
          {outgoing.map((edge) => (
            <button
              type="button"
              key={edge.id}
              className="node-panel__rel"
              onClick={() => onSelect(edge.target)}
            >
              <span className="node-panel__rel-name">{labelOf(edge.target)}</span>
              <span className="node-panel__rel-kind">{edge.label ?? EDGE_LABEL[edge.kind]}</span>
            </button>
          ))}
        </div>
      ) : null}

      {quizMode && revealed ? (
        <button type="button" className="node-panel__hide" onClick={() => setRevealed(false)}>
          收起答案
        </button>
      ) : null}
    </aside>
  );
}
