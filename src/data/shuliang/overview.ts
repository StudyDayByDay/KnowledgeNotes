import type { KnowledgeMap } from '../types';

/**
 * 数量关系方法总览：计算技巧 + 七个典型模型。
 * 重点是「看到什么信号、用哪个模型」，不求覆盖所有例题。
 * 来源：P2–P17 理论课；P19–P21 真题卷为方法应用。
 */
export const shuliangMap = {
  id: 'overview',
  module: '数量关系',
  subject: '方法总览',
  title: '数量关系方法总览',
  subtitle: '计算技巧 + 七个模型 · 先判型，再套方法',
  layout: {
    type: 'columns',
    columns: [
      { id: 'jisuan', title: '计算技巧' },
      { id: 'gongcheng', title: '工程问题' },
      { id: 'xingcheng', title: '行程问题' },
      { id: 'pailei', title: '排列组合与概率' },
      { id: 'jihe', title: '几何问题' },
      { id: 'jingji', title: '经济利润' },
      { id: 'zuizhi', title: '最值与容斥' },
      { id: 'qita', title: '其他模型' },
    ],
  },
  nodes: [
    {
      id: 'dairu',
      label: '代入排除',
      sub: '年龄 / 余数 / 多位数 / 不定方程',
      kind: 'concept',
      summary: '先定代入顺序，符合即停',
      group: 'jisuan',
      order: 1,
      refs: ['P2'],
    },
    {
      id: 'shuzi',
      label: '数字特性',
      sub: '奇偶 / 整除 / 倍数',
      kind: 'concept',
      summary: '和差同性；末位判定；比例化最简',
      group: 'jisuan',
      order: 2,
      refs: ['P2', 'P3'],
    },
    {
      id: 'fangcheng',
      label: '方程与不定方程',
      kind: 'concept',
      summary: '设所求、设小、设最小公倍数；先尾数',
      group: 'jisuan',
      order: 3,
      refs: ['P4', 'P5'],
    },

    {
      id: 'gongshi-shijian',
      label: '给定时间型',
      kind: 'concept',
      summary: '设总量为各时间的最小公倍数',
      group: 'gongcheng',
      order: 1,
      refs: ['P6'],
    },
    {
      id: 'xiaolv',
      label: '效率制约型',
      kind: 'concept',
      summary: '给效率比直接赋值，提高20%设5:6',
      group: 'gongcheng',
      order: 2,
      refs: ['P6'],
    },

    {
      id: 'jiben',
      label: '基本公式与正反比',
      sub: 'S＝vt',
      kind: 'concept',
      summary: '路程一定，速度与时间成反比',
      group: 'xingcheng',
      order: 1,
      refs: ['P7'],
    },
    {
      id: 'xiangyu',
      label: '相遇追及与环形',
      kind: 'concept',
      summary: '相遇用和、追及用差；环形第n次nS',
      group: 'xingcheng',
      order: 2,
      refs: ['P7', 'P8'],
    },

    {
      id: 'jichu',
      label: '排列组合基础',
      sub: 'A 有序，C 无序',
      kind: 'concept',
      summary: '分类加、分步乘；先选后排',
      group: 'pailei',
      order: 1,
      refs: ['P9'],
    },
    {
      id: 'teshu',
      label: '特殊模型',
      sub: '捆绑 / 插空 / 插板 / 错位',
      kind: 'concept',
      summary: '相邻捆绑、不相邻插空、至少1插板',
      group: 'pailei',
      order: 2,
      refs: ['P9', 'P10'],
    },
    {
      id: 'gailv',
      label: '概率计算',
      kind: 'concept',
      summary: '满足数÷总数；正面复杂用 1−P 反',
      group: 'pailei',
      order: 3,
      refs: ['P10'],
    },

    {
      id: 'pingmian',
      label: '平面几何与特殊三角形',
      kind: 'concept',
      summary: '30°比1:√3:2；固定周长圆面积最大',
      group: 'jihe',
      order: 1,
      refs: ['P13'],
    },
    {
      id: 'xiangsi',
      label: '相似与等比放缩',
      kind: 'concept',
      summary: '面积比＝边长比平方，体积比立方',
      group: 'jihe',
      order: 2,
      refs: ['P13'],
    },
    {
      id: 'zuiduan',
      label: '最短路径与排水法',
      kind: 'concept',
      summary: '作镜像点连直线；体积＝底面积×升高',
      group: 'jihe',
      order: 3,
      refs: ['P13'],
    },

    {
      id: 'lirun',
      label: '利润公式与列表法',
      sub: '利润＝售价−成本',
      kind: 'concept',
      summary: '多对象先列表：成本、定价、售价、销量',
      group: 'jingji',
      order: 1,
      refs: ['P11'],
    },
    {
      id: 'fenduan',
      label: '分段计费与最大收入',
      kind: 'concept',
      summary: '画数轴；和定积最大，两括号相等',
      group: 'jingji',
      order: 2,
      refs: ['P11'],
    },

    {
      id: 'zuizhi',
      label: '最值问题',
      sub: '最不利 / 数列构造 / 多集合反向',
      kind: 'concept',
      summary: '最倒霉＋1；排序定位构造求和',
      group: 'zuizhi',
      order: 1,
      refs: ['P12'],
    },
    {
      id: 'rongchi',
      label: '容斥原理',
      sub: '两集合 / 三集合标准 / 非标',
      kind: 'concept',
      summary: '三集合非标减只满足两个、减2×三个',
      group: 'zuizhi',
      order: 2,
      refs: ['P12'],
    },

    {
      id: 'nianling',
      label: '年龄与溶液',
      kind: 'concept',
      summary: '年龄差不变；浓度分母是溶液总量',
      group: 'qita',
      order: 1,
      refs: ['P14', 'P14'],
    },
    {
      id: 'niu',
      label: '牛吃草与周期日期',
      kind: 'concept',
      summary: 'Y＝(N−x)T；平年+1、闰年+2',
      group: 'qita',
      order: 2,
      refs: ['P15'],
    },
    {
      id: 'tongchou',
      label: '统筹与植树',
      sub: '关键路径 / 植树 / 钟表',
      kind: 'concept',
      summary: '关键路径不能省；线性+1、环形不加',
      group: 'qita',
      order: 3,
      refs: ['P16'],
    },
  ],
  edges: [
    { id: 'e1', source: 'dairu', target: 'shuzi', kind: 'part', label: '选项排除' },
    { id: 'e2', source: 'shuzi', target: 'fangcheng', kind: 'part', label: '建模' },

    { id: 'e4', source: 'gongshi-shijian', target: 'xiaolv', kind: 'contrast', label: '判型：时间vs效率' },

    { id: 'e5', source: 'jiben', target: 'xiangyu', kind: 'part', label: '模型扩展' },

    { id: 'e6', source: 'jichu', target: 'teshu', kind: 'part', label: '先选后排' },
    { id: 'e7', source: 'teshu', target: 'gailv', kind: 'part', label: '分母用排列组合' },

    { id: 'e8', source: 'pingmian', target: 'xiangsi', kind: 'part' },
    { id: 'e9', source: 'xiangsi', target: 'zuiduan', kind: 'part' },

    { id: 'e10', source: 'lirun', target: 'fenduan', kind: 'part', label: '价格分段' },

    { id: 'e11', source: 'zuizhi', target: 'rongchi', kind: 'contrast', label: '最不利≠容斥' },

    { id: 'e12', source: 'nianling', target: 'niu', kind: 'part' },
    { id: 'e17', source: 'niu', target: 'tongchou', kind: 'part' },

    { id: 'e13', source: 'fangcheng', target: 'nianling', kind: 'part', label: '年龄/溶液列方程' },
    { id: 'e14', source: 'shuzi', target: 'lirun', kind: 'part', label: '数字特性砍选项' },
    { id: 'e15', source: 'gongshi-shijian', target: 'jiben', kind: 'contrast', label: '同构不同量' },
    { id: 'e16', source: 'jichu', target: 'gailv', kind: 'part', label: '概率分母' },
  ],
  notes: [
    {
      kind: 'warning',
      text: '工程先判型：只给时间设总量为最小公倍数；给效率比直接赋值。',
    },
    {
      kind: 'warning',
      text: '行程必画图；等距离平均速度＝2v₁v₂/(v₁+v₂)，不是算术平均。',
    },
    {
      kind: 'warning',
      text: '排列组合：相邻捆绑、不相邻插空、相同物品每人至少1个插板；错位 D₅＝44。',
    },
    {
      kind: 'warning',
      text: '最不利＝最倒霉＋1；三集合非标减只满足两个、减2×三个。',
    },
    {
      kind: 'warning',
      text: '溶液浓度分母是溶液总重量，不是溶剂：36克盐溶于100克水＝36/136。',
    },
  ],
  sourceNotes: ['P2–P17 理论课', 'P19–P21 真题卷（方法应用）'],
} satisfies KnowledgeMap;
