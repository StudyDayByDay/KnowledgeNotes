#!/usr/bin/env node
/**
 * 统计「笔记 → 图谱」的覆盖情况。
 * 用法：node scripts/coverage.mjs
 * 说明：只按 refs 里的 Pxx 编号做粗略统计，不解析 TS。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const project = path.resolve(here, '..');
const notesRoot = path.resolve(project, '..');

const MODULES = [
  {
    slug: 'changshi',
    name: '常识判断',
    dir: '常识判断',
    subjects: {
      dangshi: '党史',
      zhongte: '中特',
      mazhe: '马哲',
      jingji: '经济',
      gudaishi: '中国古代史',
      wenxue: '文学',
      keji: '科技',
      minfa: '民法',
      xingzhengfa: '行政法',
      xingfa: '刑法',
    },
  },
  { slug: 'yanyu', name: '言语理解与表达', dir: '言语理解与表达', subjects: { fangfa: '总览' } },
  { slug: 'panduan', name: '判断推理', dir: '判断推理', subjects: { fangfa: '总览' } },
  { slug: 'shuliang', name: '数量关系', dir: '数量关系', subjects: { fangfa: '总览' } },
  { slug: 'ziliao', name: '资料分析', dir: '资料分析', subjects: { fangfa: '总览' } },
];

function noteIdsPerSubject(moduleDir, subjectName) {
  const dir = path.join(notesRoot, moduleDir, subjectName);
  if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
    return fs
      .readdirSync(dir)
      .filter((f) => /^P\d+.*\.md$/i.test(f))
      .map((f) => Number(f.match(/^P(\d+)/i)[1]));
  }
  // 顶层模块
  const top = path.join(notesRoot, moduleDir);
  return fs.existsSync(top)
    ? fs
        .readdirSync(top)
        .filter((f) => /^P\d+.*\.md$/i.test(f))
        .map((f) => Number(f.match(/^P(\d+)/i)[1]))
    : [];
}

function refsInDir(dir) {
  const ids = new Set();
  if (!fs.existsSync(dir)) return ids;
  const walk = (d) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.name.endsWith('.ts')) {
        const text = fs.readFileSync(p, 'utf8');
        for (const m of text.matchAll(/\bP(\d+)\b/g)) ids.add(Number(m[1]));
      }
    }
  };
  walk(dir);
  return ids;
}

let totalNotes = 0;
let totalCovered = 0;

for (const mod of MODULES) {
  const refs = refsInDir(path.join(project, 'src', 'data', mod.slug));
  console.log(`\n${mod.name}`);
  const rows = [];
  for (const [slug, name] of Object.entries(mod.subjects)) {
    const ids = noteIdsPerSubject(mod.dir, name);
    if (ids.length === 0) continue;
    const covered = ids.filter((id) => refs.has(id)).length;
    totalNotes += ids.length;
    totalCovered += covered;
    rows.push(`${name}: ${covered}/${ids.length}`);
  }
  console.log('  ' + rows.join('   '));
}

console.log(
  `\n合计：${totalCovered}/${totalNotes} 篇笔记被至少一张图的 refs 引用（${Math.round(
    (totalCovered / totalNotes) * 100,
  )}%）`,
);
