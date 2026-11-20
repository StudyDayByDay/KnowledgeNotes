/** 节点语义类型：颜色在图例与所有图中保持一致 */
export type NodeKind =
  | 'period'
  | 'event'
  | 'meeting'
  | 'battle'
  | 'person'
  | 'theory'
  | 'document'
  | 'concept'
  | 'confuse';

export type EdgeKind = 'time' | 'cause' | 'part' | 'contrast' | 'origin';

export interface KnowledgeNode {
  id: string;
  /** 主标题，如「遵义会议」 */
  label: string;
  /** 副标题，如「1935.01 · 贵州遵义」 */
  sub?: string;
  kind: NodeKind;
  /** 一句话定位，控制在 24 字以内 */
  summary?: string;
  /** columns 布局：所属列 id */
  group?: string;
  /** timeline 布局：所属阶段色带 id */
  band?: string;
  /** 排序权重；同年事件用小数插队（如 2.5） */
  order?: number;
  /** timeline 布局：年份 */
  year?: number;
  /** timeline / chain 布局：泳道，0 为主线，1 为旁支 */
  lane?: number;
  /** 覆盖默认节点宽度 */
  width?: number;
  /** 来源笔记章节，如 ["P3 §2.7"] */
  refs?: string[];
}

export interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  kind: EdgeKind;
  /** 边上的短语，控制在 10 字以内 */
  label?: string;
}

export interface Band {
  id: string;
  from: number;
  to: number;
  title: string;
}

export interface Column {
  id: string;
  title: string;
}

export interface MapNote {
  kind: 'warning' | 'mnemonic' | 'tip';
  text: string;
}

export type LayoutSpec =
  | {
      type: 'timeline';
      bands: Band[];
      /** 事件间距（px），默认 260 */
      step?: number;
      /** 泳道数，默认 2 */
      lanes?: number;
    }
  | {
      type: 'columns';
      columns: Column[];
    }
  | {
      type: 'chain';
    };

export interface KnowledgeMap {
  id: string;
  module: string;
  subject: string;
  title: string;
  subtitle?: string;
  layout: LayoutSpec;
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  notes?: MapNote[];
  sourceNotes?: string[];
}

export const KIND_LABEL: Record<NodeKind, string> = {
  period: '时期',
  event: '事件',
  meeting: '会议',
  battle: '战役',
  person: '人物',
  theory: '理论',
  document: '文件',
  concept: '概念',
  confuse: '易混',
};

export const EDGE_LABEL: Record<EdgeKind, string> = {
  time: '时间先后',
  cause: '因果演进',
  part: '隶属包含',
  contrast: '易混对比',
  origin: '起源',
};
