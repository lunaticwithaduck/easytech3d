const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1800, height: 1000 } });
  const p = await ctx.newPage();
  await p.goto('http://localhost:3001/bg', { waitUntil: 'load', timeout: 45000 });
  await p.waitForTimeout(2500);
  const r = await p.evaluate(() => {
    const h = Array.from(document.querySelectorAll('h2')).find(e => e.textContent.includes('Защо да купувате'));
    if (!h) return { err: 'no heading' };
    h.scrollIntoView({ block: 'center' });
    const hb = h.getBoundingClientRect();
    // the icons grid: nearest section ancestor's content container
    const grid = document.querySelector('section [class*="grid-cols-3"], section .grid');
    const gb = grid ? grid.getBoundingClientRect() : null;
    return {
      vwCenter: window.innerWidth / 2,
      heading: { l: Math.round(hb.left), r: Math.round(hb.right), c: Math.round((hb.left+hb.right)/2) },
      grid: gb ? { l: Math.round(gb.left), r: Math.round(gb.right), c: Math.round((gb.left+gb.right)/2) } : null,
    };
  });
  console.log(JSON.stringify(r, null, 2));
  await p.screenshot({ path: 'tools/output/verify-shots/wide-icons.png' });
  await b.close();
})();
