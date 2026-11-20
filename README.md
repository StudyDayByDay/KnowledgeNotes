# KnowledgeNotes · 行测知识图谱

把行测文字笔记重新组织成**可放大的大图**：颜色区分语义，箭头表达关系。
纯前端，部署在 GitHub Pages，手机随时翻看。

当前覆盖（46 张图）：

- **常识判断（32 张）**：
  - 党史 8 张：总览、土地革命、会议链、建党与国民革命、抗日战争、解放战争、战役链、背诵清单
  - 中特 4 张：总览、十个明确、五位一体、四个全面与重要保障
  - 马哲 4 张：总览、唯物论、辩证法、认识论与唯物史观
  - 经济 4 张：总览、微观、宏观、国际经济
  - 中国古代史 / 文学 / 科技：各 1 张总览
  - 民法 3 张：总览、总则与物权、合同与侵权
  - 行政法 3 张：总览、行政行为与处罚、行政复议与诉讼
  - 刑法 3 张：总览、犯罪构成与形态、刑罚与重点罪名
- **言语理解与表达（3 张）**：方法总览、片段阅读、逻辑填空
- **判断推理（4 张）**：方法总览、图形推理规律、逻辑判断、定义与类比
- **数量关系（4 张）**：方法总览、工程与行程、排列组合与概率、几何经济利润与最值
- **资料分析（3 张）**：方法总览、增长率与比重、平均数倍数与速算

常识判断 143 篇笔记已全部被图谱的 `refs` 引用；全库 209/234 篇（其余为真题卷、练习册、前言）。

## 本地运行

```bash
npm install
npm run dev
```

打开 http://localhost:5173/。

> 本机 npm registry 指向已废弃的 taobao 源。装包失败时用：
> `npm install --registry=https://registry.npmmirror.com`

## 常用命令

```bash
npm run dev          # 开发
npm run build        # 类型检查 + 生产构建
npm run preview      # 预览 dist
node scripts/screenshot.mjs   # 用本机 Chrome 截图全部图（桌面 + 手机）
node scripts/coverage.mjs     # 统计哪些笔记已被图谱引用
KN_DARK=1 KN_SET=desktop node scripts/screenshot.mjs   # 深色桌面截图
```

截图输出在 `screenshots/`。

## 目录

```
src/
├─ data/
│  ├─ types.ts                 # 数据模型
│  ├─ registry.ts              # 模块 → 科目 → 图 的索引
│  └─ changshi/dangshi/        # 党史三张图的数据
├─ layout/index.ts             # timeline / columns / chain 三种布局
├─ components/
│  ├─ MapCanvas.tsx            # React Flow 画布
│  ├─ nodes/KnowledgeNode.tsx  # 知识卡节点
│  ├─ nodes/BandNode.tsx       # 阶段色带
│  ├─ Nav.tsx / Legend.tsx / ThemeToggle.tsx
├─ hooks/useHashRoute.ts       # hash 路由（GitHub Pages 刷新不 404）
├─ hooks/useTheme.ts           # 深色模式
└─ styles/                     # 颜色 token + 布局样式
docs/extract-map.md            # 笔记 → 图谱数据的提炼规则
```

## 新增一张图

1. 新建 `src/data/<模块>/<科目>/<图 id>.ts`，导出 `satisfies KnowledgeMap`。
2. 在 `src/data/registry.ts` 对应科目的 `maps` 数组里加一行。
3. 数据只写语义（`year` / `group` / `lane` / `order`），**不要手写 x/y**。
4. 按 `docs/extract-map.md` 自检。

## 部署

1. 在 GitHub 新建仓库 `KnowledgeNotes`（公开仓库的 Pages 免费）。
2. 本地：

```bash
git init -b main
git add .
git commit -m "feat: 党史知识图谱样板"
git remote add origin git@github.com:<你的账号>/KnowledgeNotes.git
git push -u origin main
```

3. 仓库 Settings → Pages → Build and deployment → Source 选 **GitHub Actions**。
4. 之后每次 push 到 `main` 自动部署到
   `https://<你的账号>.github.io/KnowledgeNotes/`。

`vite.config.ts` 已按生产环境设置 `base: '/KnowledgeNotes/'`，改仓库名时同步改这里。

## 内容来源

`行测知识/常识判断/党史/P1–P5` 视频笔记。每个节点数据里保留 `refs`（如 `P3 §2.7`），便于回查。
笔记中标「待核对」的内容没有进图。
