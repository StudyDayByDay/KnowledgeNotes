import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  ReactFlow,
  getNodesBounds,
  getViewportForBounds,
  type Edge,
  type EdgeTypes,
  type Node,
  type NodeTypes,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/style.css';
import type { EdgeKind, KnowledgeMap, NodeKind } from '../data/types';
import { validateMap } from '../data/validate';
import { layoutMap } from '../layout';
import type { Theme } from '../hooks/useTheme';
import Legend from './Legend';
import NodePanel from './NodePanel';
import KnEdge from './edges/KnEdge';
import BandNode from './nodes/BandNode';
import KnowledgeNode from './nodes/KnowledgeNode';

const nodeTypes: NodeTypes = {
  knowledge: KnowledgeNode,
  band: BandNode,
};

const edgeTypes: EdgeTypes = {
  kn: KnEdge,
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
  focusNode?: string;
}

export default function MapCanvas({ map, theme, focusNode }: MapCanvasProps) {
  const isMobile =
    typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches;

  const [selectedId, setSelectedId] = useState<string | null>(focusNode ?? null);
  const [instance, setInstance] = useState<ReactFlowInstance | null>(null);
  const [exporting, setExporting] = useState(false);
  const [quiz, setQuiz] = useState(false);

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
        className: selectedId === item.id ? 'is-focus' : undefined,
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
      type: 'kn',
      className: `kn-edge kn-edge--${e.kind}`,
      data: { label: e.label },
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
  }, [map, theme, selectedId]);

  const fitNode = useCallback(
    (id: string) => {
      if (!instance) return;
      if (isMobile) {
        const node = instance.getNode(id);
        if (node) {
          const width = node.measured?.width ?? 230;
          const height = node.measured?.height ?? 132;
          const cx = node.position.x + width / 2;
          const cy = node.position.y + height / 2;
          // 手机上详情面板占下半屏，把节点放到上半屏
          instance.setCenter(cx, cy + 150, { zoom: 0.9, duration: 500 });
          return;
        }
      }
      instance.fitView({ nodes: [{ id }], padding: 240, maxZoom: 1.15, duration: 500 });
    },
    [instance, isMobile],
  );

  useEffect(() => {
    if (!focusNode) return;
    setSelectedId(focusNode);
    const timer = window.setTimeout(() => fitNode(focusNode), 120);
    return () => window.clearTimeout(timer);
  }, [focusNode, fitNode]);

  const onInit = useCallback((rf: ReactFlowInstance) => {
    setInstance(rf);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document
          .querySelector('.graph-canvas')
          ?.setAttribute('data-graph-ready', 'true');
      });
    });
  }, []);

  const exportPng = useCallback(async () => {
    if (!instance) return;
    const viewportEl = document.querySelector<HTMLElement>(
      '.graph-canvas .react-flow__viewport',
    );
    if (!viewportEl) return;

    setExporting(true);
    try {
      const allNodes = instance.getNodes();
      const bounds = getNodesBounds(allNodes);
      if (bounds.width <= 0 || bounds.height <= 0) throw new Error('节点尚未测量完成');

      const maxSide = 3200;
      const scale = Math.min(1.6, maxSide / Math.max(bounds.width, bounds.height));
      const width = Math.max(900, Math.round(bounds.width * scale));
      const height = Math.max(600, Math.round(bounds.height * scale));
      const vp = getViewportForBounds(bounds, width, height, 0.05, 2, 24);
      const { toPng } = await import('html-to-image');

      const dataUrl = await toPng(viewportEl, {
        backgroundColor: theme === 'dark' ? '#0d1524' : '#f8fafc',
        width,
        height,
        cacheBust: true,
        pixelRatio: 1,
        style: {
          width: `${width}px`,
          height: `${height}px`,
          transform: `translate(${vp.x}px, ${vp.y}px) scale(${vp.zoom})`,
        },
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${map.module}-${map.subject}-${map.title}.png`;
      link.click();
    } catch (error) {
      console.error('[KnowledgeNotes] 导出 PNG 失败', error);
    } finally {
      setExporting(false);
    }
  }, [instance, map, theme]);

  const initialViewport =
    map.layout.type === 'columns'
      ? { x: 40, y: isMobile ? 24 : 30, zoom: isMobile ? 0.75 : 0.85 }
      : map.layout.type === 'chain'
        ? { x: 50, y: isMobile ? 115 : 52, zoom: isMobile ? 0.72 : 0.8 }
        : { x: 40, y: isMobile ? 175 : 122, zoom: isMobile ? 0.7 : 0.78 };

  const selectedNode = selectedId
    ? map.nodes.find((node) => node.id === selectedId)
    : undefined;

  return (
    <div
      className={`map-stage ${quiz ? 'is-quiz' : ''} ${selectedNode ? 'has-panel' : ''}`}
      data-layout={map.layout.type}
    >
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
            edgeTypes={edgeTypes}
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
            onNodeClick={(_, node) => {
              if (node.type === 'knowledge') setSelectedId(node.id);
            }}
            onPaneClick={() => setSelectedId(null)}
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

        <button
          type="button"
          className={`quiz-btn ${quiz ? 'is-on' : ''}`}
          onClick={() => setQuiz((v) => !v)}
          title={quiz ? '显示卡片上的考点' : '隐藏卡片考点，点节点自测'}
        >
          {quiz ? '退出自测' : '自测模式'}
        </button>

        <button
          type="button"
          className="export-btn"
          onClick={exportPng}
          disabled={exporting}
        >
          {exporting ? '导出中…' : '导出 PNG'}
        </button>

        {selectedNode ? (
          <NodePanel
            key={`${selectedNode.id}-${quiz ? 'quiz' : 'read'}`}
            node={selectedNode}
            map={map}
            quizMode={quiz}
            onClose={() => setSelectedId(null)}
            onSelect={(id) => {
              setSelectedId(id);
              fitNode(id);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
