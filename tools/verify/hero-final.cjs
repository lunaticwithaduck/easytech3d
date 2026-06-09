const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1600, height: 800 } });
  const p = await ctx.newPage();
  await p.goto('http://localhost:3001/bg', { waitUntil: 'load', timeout: 45000 });
  await p.waitForTimeout(2500);
  const r = await p.evaluate(() => {
    const h = Array.from(document.querySelectorAll('h2')).find(e => (e.textContent||'').includes('Nature3D'));
    if (!h) return null; const b = h.getBoundingClientRect();
    return { left: Math.round(b.left), top: Math.round(b.top), fs: getComputedStyle(h).fontSize };
  });
  console.log('LOCAL hero title now:', JSON.stringify(r), '(live = left:215 top:455 fs:100px)');
  await p.screenshot({ path: 'tools/output/verify-shots/hero-fixed.png' });
  await b.close();
})();
