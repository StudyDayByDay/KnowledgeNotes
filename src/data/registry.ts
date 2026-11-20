import type { KnowledgeMap } from './types';
import { overviewMap } from './changshi/dangshi/overview';
import { tudiGemingMap } from './changshi/dangshi/tudi-geming';
import { meetingsMap } from './changshi/dangshi/meetings';

export interface SubjectEntry {
  id: string;
  title: string;
  maps: KnowledgeMap[];
}

export interface ModuleEntry {
  id: string;
  title: string;
  note?: string;
  subjects: SubjectEntry[];
}

/**
 * 全站索引：新增一张图 = 新建一个数据文件 + 在对应 maps 数组里加一行。
 * 模块 id 用拼音、科目 id 用拼音、图 id 用短横线，保证 hash 链接稳定。
 */
export const MODULES: ModuleEntry[] = [
  {
    id: 'changshi',
    title: '常识判断',
    subjects: [
      {
        id: 'dangshi',
        title: '党史',
        maps: [overviewMap, tudiGemingMap, meetingsMap],
      },
    ],
  },
  {
    id: 'yanyu',
    title: '言语理解与表达',
    note: '待接入',
    subjects: [],
  },
  {
    id: 'panduan',
    title: '判断推理',
    note: '待接入',
    subjects: [],
  },
  {
    id: 'shuliang',
    title: '数量关系',
    note: '待接入',
    subjects: [],
  },
  {
    id: 'ziliao',
    title: '资料分析',
    note: '待接入',
    subjects: [],
  },
];

export function findModule(moduleId: string): ModuleEntry | undefined {
  return MODULES.find((m) => m.id === moduleId);
}

export function findSubject(
  moduleId: string,
  subjectId: string,
): SubjectEntry | undefined {
  return findModule(moduleId)?.subjects.find((s) => s.id === subjectId);
}

export function findMap(
  moduleId: string,
  subjectId: string,
  mapId: string,
): KnowledgeMap | undefined {
  return findSubject(moduleId, subjectId)?.maps.find((m) => m.id === mapId);
}

export const FIRST_MAP = overviewMap;
