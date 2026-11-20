import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { KIND_LABEL, type KnowledgeNode as KnowledgeNodeModel } from '../../data/types';

export type KnowledgeNodeData = { node: KnowledgeNodeModel };

function KnowledgeNode({ data }: NodeProps) {
  const n = (data as KnowledgeNodeData).node;
  if (!n) return null;
  const tooltip = [n.label, n.sub, n.summary].filter(Boolean).join(' · ');

  return (
    <div className="kn-node" data-kind={n.kind} title={tooltip}>
      <span className="kn-node__kind">{KIND_LABEL[n.kind]}</span>
      <div className="kn-node__title">{n.label}</div>
      {n.sub ? <div className="kn-node__sub">{n.sub}</div> : null}
      {n.summary ? <div className="kn-node__summary">{n.summary}</div> : null}
      <Handle type="target" position={Position.Left} className="kn-handle" isConnectable={false} />
      <Handle type="source" position={Position.Right} className="kn-handle" isConnectable={false} />
    </div>
  );
}

export default memo(KnowledgeNode);
