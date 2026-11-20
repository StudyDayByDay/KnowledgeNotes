import type { Band, Column, KnowledgeMap, KnowledgeNode } from '../data/types';

export interface LaidNode {
  id: string;
  type: 'knowledge' | 'band';
  x: number;
  y: number;
  width: number;
  height: number;
  lane: number;
  node?: KnowledgeNode;
  band?: Band;
  column?: Column;
}

export interface LayoutResult {
  nodes: LaidNode[];
  width: number;
  height: number;
}

export const NODE_WIDTH = 230;
export const NODE_HEIGHT = 132;
const PAD = 80;

function sortNodes(nodes: KnowledgeNode[]): KnowledgeNode[] {
  return [...nodes].sort(
    (a, b) => (a.year ?? 0) - (b.year ?? 0) || (a.order ?? 0) - (b.order ?? 0),
  );
}

/**
 * 时间轴：事件按年份/order 等距排开（不按真实年份比例，避免 1921–1949 挤成一团），
 * 阶段色带包住其成员节点。横向滚动浏览，顺序与归属才是重点。
 */
export function layoutTimeline(map: KnowledgeMap): LayoutResult {
  if (map.layout.type !== 'timeline') throw new Error('layout mismatch');
  const step = map.layout.step ?? 270;
  const laneCount = map.layout.lanes ?? 2;
  const laneY = [130, 380, 640];
  const BAND_PAD = 28;
  const BAND_GAP = 48;
  const nodes = sortNodes(map.nodes);
  const width = (n: KnowledgeNode) => n.width ?? NODE_WIDTH;

  // 按事件顺序累计 x；跨阶段时额外留出空隙，让相邻色带不贴在一起。
  const posX = new Map<string, number>();
  let cursorX = PAD;
  nodes.forEach((n, i) => {
    if (i > 0 && n.band !== nodes[i - 1].band) cursorX += BAND_GAP;
    posX.set(n.id, cursorX);
    cursorX += step;
  });

  const laid: LaidNode[] = [];

  nodes.forEach((n) => {
    laid.push({
      id: n.id,
      type: 'knowledge',
      node: n,
      x: posX.get(n.id) ?? PAD,
      y: laneY[Math.min(n.lane ?? 0, laneCount - 1)] ?? laneY[0],
      width: width(n),
      height: NODE_HEIGHT,
      lane: n.lane ?? 0,
    });
  });

  const bandHeight = laneY[Math.min(1, laneCount - 1)] + NODE_HEIGHT + 70 - 50;
  let cursor = PAD - 50;

  map.layout.bands.forEach((band) => {
    const members = nodes.filter((n) => n.band === band.id);
    let x1: number;
    let x2: number;
    if (members.length > 0) {
      const xs = members.map((n) => posX.get(n.id) ?? PAD);
      x1 = Math.min(...xs) - BAND_PAD;
      x2 = Math.max(...xs) + Math.max(...members.map(width)) + BAND_PAD;
    } else {
      x1 = cursor + BAND_GAP;
      x2 = x1 + 220;
    }
    x1 = Math.max(x1, cursor + 12);
    cursor = x2;
    laid.unshift({
      id: `band-${band.id}`,
      type: 'band',
      band,
      x: x1,
      y: 40,
      width: x2 - x1,
      height: bandHeight,
      lane: 0,
    });
  });

  const maxX = laid.reduce((m, n) => Math.max(m, n.x + n.width), 0);
  return { nodes: laid, width: maxX + PAD, height: bandHeight + 120 };
}

/** 分栏：每个分组一列，组内按 order 纵向排列。 */
export function layoutColumns(map: KnowledgeMap): LayoutResult {
  if (map.layout.type !== 'columns') throw new Error('layout mismatch');
  const COL_W = 320;
  const GAP = 50;
  const ROW = 184;

  const laid: LaidNode[] = [];
  const maxCount = Math.max(
    ...map.layout.columns.map(
      (col) => map.nodes.filter((n) => n.group === col.id).length,
    ),
    1,
  );
  const bandHeight = 150 + maxCount * ROW;
  let maxHeight = bandHeight;

  map.layout.columns.forEach((col, ci) => {
    const x = PAD + ci * (COL_W + GAP);
    const members = map.nodes
      .filter((n) => n.group === col.id)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    maxHeight = Math.max(maxHeight, 150 + members.length * ROW);

    laid.push({
      id: `column-${col.id}`,
      type: 'band',
      column: col,
      x,
      y: 40,
      width: COL_W,
      height: bandHeight,
      lane: 0,
    });

    members.forEach((n, i) => {
      laid.push({
        id: n.id,
        type: 'knowledge',
        node: n,
        x: x + (COL_W - (n.width ?? 240)) / 2,
        y: 130 + i * ROW,
        width: n.width ?? 240,
        height: NODE_HEIGHT,
        lane: 0,
      });
    });
  });

  return {
    nodes: laid,
    width: PAD * 2 + map.layout.columns.length * COL_W + (map.layout.columns.length - 1) * GAP,
    height: maxHeight + 100,
  };
}

/**
 * 关系链：主线按 order 水平排开，lane 1 的旁支下沉一行。
 * 用小数 order 可把旁支插在两个主节点之间。
 */
export function layoutChain(map: KnowledgeMap): LayoutResult {
  const STEP = 320;
  const MAIN_Y = 180;
  const BRANCH_Y = 480;

  const laid: LaidNode[] = map.nodes.map((n) => {
    const order = n.order ?? 0;
    return {
      id: n.id,
      type: 'knowledge',
      node: n,
      x: PAD + order * STEP,
      y: (n.lane ?? 0) === 0 ? MAIN_Y : BRANCH_Y,
      width: n.width ?? 220,
      height: NODE_HEIGHT,
      lane: n.lane ?? 0,
    };
  });

  const maxX = laid.reduce((m, n) => Math.max(m, n.x + n.width), 0);
  return { nodes: laid, width: maxX + PAD, height: BRANCH_Y + NODE_HEIGHT + 80 };
}

export function layoutMap(map: KnowledgeMap): LayoutResult {
  switch (map.layout.type) {
    case 'timeline':
      return layoutTimeline(map);
    case 'columns':
      return layoutColumns(map);
    case 'chain':
      return layoutChain(map);
  }
}
