import puppeteer from 'puppeteer-core';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = process.env.KN_BASE ?? 'http://127.0.0.1:5173';
const DARK = process.env.KN_DARK === '1';
const ONLY = process.env.KN_SET ?? 'all';

const ROUTES = [
  ['changshi', 'dangshi', 'overview', 'dangshi-overview'],
  ['changshi', 'dangshi', 'tudi-geming', 'dangshi-tudi'],
  ['changshi', 'dangshi', 'meetings', 'dangshi-meetings'],
  ['changshi', 'dangshi', 'jiandang-guomin', 'dangshi-p2'],
  ['changshi', 'dangshi', 'kangri-zhanzheng', 'dangshi-p4'],
  ['changshi', 'dangshi', 'jiefang-zhanzheng', 'dangshi-p5'],
  ['changshi', 'dangshi', 'battles', 'dangshi-battles'],
  ['changshi', 'dangshi', 'recite', 'dangshi-recite'],
  ['changshi', 'zhongte', 'overview', 'zhongte-overview'],
  ['changshi', 'zhongte', 'zhongte-mingque', 'zhongte-mingque'],
  ['changshi', 'zhongte', 'zhongte-wuwei', 'zhongte-wuwei'],
  ['changshi', 'zhongte', 'zhongte-sige', 'zhongte-sige'],
  ['changshi', 'mazhe', 'overview', 'mazhe-overview'],
  ['changshi', 'mazhe', 'weiwu', 'mazhe-weiwu'],
  ['changshi', 'mazhe', 'bianzheng', 'mazhe-bianzheng'],
  ['changshi', 'mazhe', 'renshi', 'mazhe-renshi'],
  ['changshi', 'jingji', 'overview', 'jingji-overview'],
  ['changshi', 'jingji', 'jingji-weiguan', 'jingji-weiguan'],
  ['changshi', 'jingji', 'jingji-hongguan', 'jingji-hongguan'],
  ['changshi', 'jingji', 'jingji-guojii', 'jingji-guojii'],
  ['changshi', 'gudaishi', 'overview', 'gudaishi-overview'],
  ['changshi', 'wenxue', 'overview', 'wenxue-overview'],
  ['changshi', 'keji', 'overview', 'keji-overview'],
  ['changshi', 'minfa', 'overview', 'minfa-overview'],
  ['changshi', 'xingzhengfa', 'overview', 'xingzhengfa-overview'],
  ['changshi', 'xingfa', 'overview', 'xingfa-overview'],
  ['panduan', 'fangfa', 'overview', 'panduan-overview'],
  ['ziliao', 'fangfa', 'overview', 'ziliao-overview'],
  ['yanyu', 'fangfa', 'overview', 'yanyu-overview'],
  ['shuliang', 'fangfa', 'overview', 'shuliang-overview'],
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--hide-scrollbars', '--disable-gpu'],
});

let failures = 0;

async function shoot(moduleId, subjectId, mapId, name, size) {
  const page = await browser.newPage();
  if (DARK) {
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('kn-theme', 'dark');
    });
  }
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    const text = m.text();
    if (m.type() === 'error') errors.push(`console: ${text}`);
    if (m.type() === 'warning' && text.includes('[KnowledgeNotes]')) {
      errors.push(`data: ${text}`);
    }
  });

  const mobile = size.width <= 900;
  await page.setViewport({
    width: size.width,
    height: size.height,
    deviceScaleFactor: size.scale ?? 1,
    isMobile: mobile,
    hasTouch: mobile,
  });

  const url = `${BASE}/#/m/${moduleId}/${subjectId}/${mapId}`;
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.waitForSelector('[data-graph-ready="true"]', { timeout: 15000 });
  await new Promise((r) => setTimeout(r, 350));

  const info = await page.evaluate(() => {
    const rect = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
    };
    const clipped = [...document.querySelectorAll('.kn-node')].flatMap((card) => {
      const name = card.querySelector('.kn-node__title')?.textContent ?? '';
      const hit = [];
      for (const sel of ['.kn-node__title', '.kn-node__sub', '.kn-node__summary']) {
        const el = card.querySelector(sel);
        if (el && (el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1)) {
          hit.push(sel);
        }
      }
      return hit.length ? [{ name, hit }] : [];
    });
    return {
      viewport: { w: innerWidth, h: innerHeight },
      graphArea: rect('.graph-area'),
      nodeCount: document.querySelectorAll('.react-flow__node').length,
      edgeCount: document.querySelectorAll('.react-flow__edge').length,
      clipped,
    };
  });

  await page.screenshot({ path: `screenshots/${name}.png` });
  console.log(`\n=== ${name} ===`);
  console.log(JSON.stringify(info));
  if (info.clipped.length) failures += info.clipped.length;
  if (errors.length) {
    failures += errors.length;
    console.log('ERRORS:', errors);
  }
  await page.close();
}

for (const [moduleId, subjectId, mapId, name] of ROUTES) {
  if (ONLY !== 'mobile') {
    await shoot(moduleId, subjectId, mapId, `${name}-desktop${DARK ? '-dark' : ''}`, {
      width: 1440,
      height: 900,
    });
  }
  if (ONLY !== 'desktop') {
    await shoot(moduleId, subjectId, mapId, `${name}-mobile${DARK ? '-dark' : ''}`, {
      width: 390,
      height: 844,
      scale: 2,
    });
  }
}

await browser.close();
console.log(failures ? `\n${failures} issues` : '\nno browser errors, no clipped text');
