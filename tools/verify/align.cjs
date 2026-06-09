const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const vw of [1600, 1920]) {
    const ctx = await b.newContext({ viewport: { width: vw, height: 800 } });
    const p = await ctx.newPage();
    await p.goto('http://localhost:3001/bg', { waitUntil: 'load', timeout: 45000 });
    await p.waitForTimeout(2500);
    const r = await p.evaluate(() => {
      const hero = Array.from(document.querySelectorAll('h2')).find(e => (e.textContent||'').includes('Nature3D'));
      const sect = Array.from(document.querySelectorAll('h2')).find(e => (e.textContent||'').includes('Филаменти за 3D'));
      const lb = el => el ? Math.round(el.getBoundingClientRect().left) : null;
      return { heroLeft: lb(hero), sectionLeft: lb(sect) };
    });
    console.log(`@${vw}:`, JSON.stringify(r), '(should match)');
    await ctx.close();
  }
  // screenshot at 1600
  const ctx = await b.newContext({ viewport: { width: 1600, height: 800 } });
  const p = await ctx.newPage();
  await p.goto('http://localhost:3001/bg', { waitUntil: 'load', timeout: 45000 });
  await p.waitForTimeout(2500);
  await p.screenshot({ path: 'tools/output/verify-shots/hero-aligned.png' });
  await b.close();
})();
