import { useCallback, useMemo } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  ReactFlow,
  type Edge,
  type Node,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/style.css';
import type { EdgeKind, KnowledgeMap, NodeKind } from '../data/types';
import { validateMap } from '../data/validate';
import { layoutMap } from '../layout';
import type { Theme } from '../hooks/useTheme';
import Legend from './Legend';
import BandNode from './nodes/BandNode';
import KnowledgeNode from './nodes/KnowledgeNode';

const nodeTypes: NodeTypes = {
  knowledge: KnowledgeNode,
  band: BandNode,
};

const EDGE_HEX: Record<Theme, Record<EdgeKind, string>> = {
  light: {
    time: '#94a3b8',
    cause: '#4b74ad',
    part: '#7c8ea8',
    contrast: '#c0392b',
    origin: '#8b5cf6',
  },
  dark: {
    time: '#64748b',
    cause: '#7aa2d8',
    part: '#93a8c4',
    contrast: '#ef6b6b',
    origin: '#a78bfa',
  },
};

const KIND_ORDER: NodeKind[] = [
  'period',
  'event',
  'battle',
  'meeting',
  'document',
  'person',
  'theory',
  'concept',
  'confuse',
];

interface MapCanvasProps {
  map: KnowledgeMap;
  theme: Theme;
}

export default function MapCanvas({ map, theme }: MapCanvasProps) {
  const isMobile =
    typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches;

  const { nodes, edges, kinds } = useMemo(() => {
    if (import.meta.env.DEV) {
      const issues = validateMap(map);
      if (issues.length > 0) console.warn(`[KnowledgeNotes] 图 ${map.id} 数据有问题：`, issues);
    }
    const laid = layoutMap(map);
    const colors = EDGE_HEX[theme];

    const flowNodes: Node[] = laid.nodes.map((item) => {
      if (item.type === 'band') {
        const title = item.band?.title ?? item.column?.title ?? '';
        return {
          id: item.id,
          type: 'band',
          position: { x: item.x, y: item.y },
          data: { title, variant: item.band ? 'timeline' : 'column' },
          style: { width: item.width, height: item.height },
          draggable: false,
          selectable: false,
          connectable: false,
          focusable: false,
          zIndex: 0,
        };
      }
      return {
        id: item.id,
        type: 'knowledge',
        position: { x: item.x, y: item.y },
        data: { node: item.node },
        style: { width: item.width, height: item.height },
        draggable: false,
        selectable: false,
        connectable: false,
        focusable: false,
        zIndex: 2,
      };
    });

    const flowEdges: Edge[] = map.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'smoothstep',
      className: `kn-edge kn-edge--${e.kind}`,
      label: e.label,
      labelStyle: { fill: 'var(--muted)', fontSize: 11, fontWeight: 600 },
      labelBgStyle: { fill: 'var(--canvas)', fillOpacity: 0.95 },
      labelBgPadding: [6, 3],
      labelBgBorderRadius: 4,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 16,
        height: 16,
        color: colors[e.kind],
      },
      zIndex: 1,
    }));

    const present = new Set(map.nodes.map((n) => n.kind));
    return {
      nodes: flowNodes,
      edges: flowEdges,
      kinds: KIND_ORDER.filter((k) => present.has(k)),
    };
  }, [map, theme]);

  const onInit = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document
          .querySelector('.graph-canvas')
          ?.setAttribute('data-graph-ready', 'true');
      });
    });
  }, []);

  const initialViewport =
    map.layout.type === 'columns'
      ? { x: 40, y: isMobile ? 24 : 30, zoom: isMobile ? 0.75 : 0.85 }
      : map.layout.type === 'chain'
        ? { x: 50, y: isMobile ? 115 : 52, zoom: isMobile ? 0.72 : 0.8 }
        : { x: 40, y: isMobile ? 175 : 122, zoom: isMobile ? 0.7 : 0.78 };

  return (
    <div className="map-stage">
      <div className="canvas-head">
        <div className="canvas-head__kicker">
          {map.module} · {map.subject}
        </div>
        <h1 className="canvas-head__title">{map.title}</h1>
        {map.subtitle ? <div className="canvas-head__sub">{map.subtitle}</div> : null}
      </div>

      <div className="graph-area">
        <div className="graph-canvas" data-graph-ready="false">
          <ReactFlow
            key={map.id}
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            defaultViewport={initialViewport}
            minZoom={0.05}
            maxZoom={2.2}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            zoomOnDoubleClick={false}
            zIndexMode="manual"
            forceColorMode={theme}
            proOptions={{ hideAttribution: true }}
            onInit={onInit}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={26}
              size={1.2}
              color="var(--grid-dot)"
            />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>

        <Legend kinds={kinds} />
      </div>
    </div>
  );
}
