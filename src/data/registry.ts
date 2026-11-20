import type { KnowledgeMap } from './types';
import { overviewMap } from './changshi/dangshi/overview';
import { tudiGemingMap } from './changshi/dangshi/tudi-geming';
import { meetingsMap } from './changshi/dangshi/meetings';
import { zhongteMap } from './changshi/zhongte/overview';
import { mazheMap } from './changshi/mazhe/overview';
import { jingjiMap } from './changshi/jingji/overview';
import { gudaishiMap } from './changshi/gudaishi/overview';
import { wenxueMap } from './changshi/wenxue/overview';
import { kejiMap } from './changshi/keji/overview';
import { minfaMap } from './changshi/minfa/overview';
import { xingzhengfaMap } from './changshi/xingzhengfa/overview';
import { xingfaMap } from './changshi/xingfa/overview';
import { panduanMap } from './panduan/overview';
import { ziliaoMap } from './ziliao/overview';
import { yanyuMap } from './yanyu/overview';
import { shuliangMap } from './shuliang/overview';

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
 * 模块 id / 科目 id 用拼音，图 id 用短横线，保证 hash 链接稳定。
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
      { id: 'zhongte', title: '中特', maps: [zhongteMap] },
      { id: 'mazhe', title: '马哲', maps: [mazheMap] },
      { id: 'jingji', title: '经济', maps: [jingjiMap] },
      { id: 'gudaishi', title: '中国古代史', maps: [gudaishiMap] },
      { id: 'keji', title: '科技', maps: [kejiMap] },
      { id: 'minfa', title: '民法', maps: [minfaMap] },
      { id: 'xingzhengfa', title: '行政法', maps: [xingzhengfaMap] },
      { id: 'xingfa', title: '刑法', maps: [xingfaMap] },
      { id: 'wenxue', title: '文学', maps: [wenxueMap] },
    ],
  },
  {
    id: 'yanyu',
    title: '言语理解与表达',
    subjects: [{ id: 'fangfa', title: '方法总览', maps: [yanyuMap] }],
  },
  {
    id: 'shuliang',
    title: '数量关系',
    subjects: [{ id: 'fangfa', title: '方法总览', maps: [shuliangMap] }],
  },
  {
    id: 'panduan',
    title: '判断推理',
    subjects: [{ id: 'fangfa', title: '方法总览', maps: [panduanMap] }],
  },
  {
    id: 'ziliao',
    title: '资料分析',
    subjects: [{ id: 'fangfa', title: '方法总览', maps: [ziliaoMap] }],
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
