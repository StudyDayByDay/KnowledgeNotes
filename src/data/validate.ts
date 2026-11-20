import type { KnowledgeMap } from './types';

/** 结构性自检：只查数据一致性，不查史实。开发环境在控制台报警。 */
export function validateMap(map: KnowledgeMap): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const node of map.nodes) {
    if (ids.has(node.id)) errors.push(`重复节点 id：${node.id}`);
    ids.add(node.id);
    if (!node.label.trim()) errors.push(`节点缺少标题：${node.id}`);
    if (node.summary && node.summary.length > 30) {
      errors.push(`summary 过长（${node.summary.length} 字）：${node.id}`);
    }
  }

  for (const edge of map.edges) {
    if (!ids.has(edge.source)) errors.push(`边 source 不存在：${edge.id} → ${edge.source}`);
    if (!ids.has(edge.target)) errors.push(`边 target 不存在：${edge.id} → ${edge.target}`);
    if (edge.label && edge.label.length > 12) {
      errors.push(`边 label 过长（${edge.label.length} 字）：${edge.id}`);
    }
  }

  if (map.layout.type === 'timeline') {
    const bandIds = new Set(map.layout.bands.map((b) => b.id));
    for (const node of map.nodes) {
      if (node.year === undefined) errors.push(`timeline 节点缺少 year：${node.id}`);
      if (!node.band || !bandIds.has(node.band)) {
        errors.push(`节点 band 无对应定义：${node.id}`);
      }
    }
  }

  if (map.layout.type === 'columns') {
    const columnIds = new Set(map.layout.columns.map((c) => c.id));
    for (const node of map.nodes) {
      if (!node.group || !columnIds.has(node.group)) {
        errors.push(`节点 group 无对应列：${node.id}`);
      }
    }
  }

  return errors;
}
