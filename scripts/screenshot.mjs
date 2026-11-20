import puppeteer from 'puppeteer-core';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = process.env.KN_BASE ?? 'http://127.0.0.1:5173';
const DARK = process.env.KN_DARK === '1';
const ONLY = process.env.KN_SET ?? 'all';

const MAPS = [
  ['overview', '党史总览'],
  ['tudi-geming', '土地革命'],
  ['meetings', '中共会议链'],
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--hide-scrollbars', '--disable-gpu'],
});

let failures = 0;

async function shoot(mapId, size, name) {
  const page = await browser.newPage();
  if (DARK) {
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('kn-theme', 'dark');
    });
  }
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`);
  });

  const mobile = size.width <= 900;
  await page.setViewport({
    width: size.width,
    height: size.height,
    deviceScaleFactor: size.scale ?? 1,
    isMobile: mobile,
    hasTouch: mobile,
  });

  const url = `${BASE}/#/m/changshi/dangshi/${mapId}`;
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.waitForSelector('[data-graph-ready="true"]', { timeout: 15000 });
  await new Promise((r) => setTimeout(r, 400));

  const info = await page.evaluate(() => {
    const rect = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
    };
    return {
      viewport: { w: innerWidth, h: innerHeight },
      bodyScroll: document.body.scrollWidth,
      shell: rect('.map-shell'),
      canvasWrap: rect('.canvas-wrap'),
      graphArea: rect('.graph-area'),
      legend: rect('.legend'),
      notes: rect('.side-notes'),
      topbar: rect('.topbar'),
      topbarButtons: [...document.querySelectorAll('.topbar .icon-btn')].map((b) => ({
        text: b.textContent?.trim(),
        rect: b.getBoundingClientRect().toJSON(),
      })),
      nodeCount: document.querySelectorAll('.react-flow__node').length,
      edgeCount: document.querySelectorAll('.react-flow__edge').length,
    };
  });

  await page.screenshot({ path: `screenshots/${name}.png` });
  console.log(`\n=== ${name} ===`);
  console.log(JSON.stringify(info, null, 2));
  if (errors.length) {
    failures += errors.length;
    console.log('ERRORS:', errors);
  }
  await page.close();
}

for (const [id] of MAPS) {
  if (ONLY !== 'mobile') {
    await shoot(id, { width: 1440, height: 900 }, `${id}-desktop${DARK ? '-dark' : ''}`);
  }
  if (ONLY !== 'desktop') {
    await shoot(id, { width: 390, height: 844, scale: 2 }, `${id}-mobile${DARK ? '-dark' : ''}`);
  }
}

await browser.close();
console.log(failures ? `\n${failures} browser errors` : '\nno browser errors');
