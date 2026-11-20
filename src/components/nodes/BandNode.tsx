import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';

export type BandNodeData = { title: string; variant: 'timeline' | 'column' };

function BandNode({ data }: NodeProps) {
  const d = data as BandNodeData;
  return (
    <div className={`kn-band ${d.variant === 'column' ? 'kn-band--column' : ''}`}>
      <div className="kn-band__title">{d.title}</div>
    </div>
  );
}

export default memo(BandNode);
