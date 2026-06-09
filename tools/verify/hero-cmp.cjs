const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const [name, url] of [['local','http://localhost:3001/bg'], ['live','https://easytech3d.com/']]) {
    const ctx = await b.newContext({ viewport: { width: 1600, height: 800 } });
    const p = await ctx.newPage();
    await p.goto(url, { waitUntil: 'load', timeout: 60000 }).catch(()=>{});
    await p.waitForTimeout(3500);
    await p.screenshot({ path: `tools/output/verify-shots/hero-${name}.png` }); // viewport only
    // report the hero heading position
    const r = await p.evaluate(() => {
      const h = document.querySelector('h1, h2');
      const heads = Array.from(document.querySelectorAll('h1,h2'));
      const hero = heads.find(e => /Nature3D|RE3D|EasyTech3D/i.test(e.textContent||''));
      const el = hero || h;
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { text: (el.textContent||'').trim().slice(0,20), left: Math.round(b.left), top: Math.round(b.top), fs: getComputedStyle(el).fontSize };
    });
    console.log(name, JSON.stringify(r));
    await ctx.close();
  }
  await b.close();
})();
