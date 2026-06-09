const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1600, height: 800 } });
  const p = await ctx.newPage();
  await p.goto('http://localhost:3001/bg', { waitUntil: 'load', timeout: 45000 });
  await p.waitForTimeout(2500);
  const chain = await p.evaluate(() => {
    const h = Array.from(document.querySelectorAll('h2')).find(e => (e.textContent||'').includes('Nature3D'));
    if (!h) return 'no heading';
    const out = [];
    let el = h;
    for (let i = 0; i < 6 && el; i++) {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      out.push({
        tag: el.tagName, cls: (el.className||'').toString().slice(0, 70),
        left: Math.round(r.left), width: Math.round(r.width),
        display: cs.display, alignItems: cs.alignItems, justifyContent: cs.justifyContent,
        ml: cs.marginLeft, mr: cs.marginRight, maxW: cs.maxWidth, textAlign: cs.textAlign,
      });
      el = el.parentElement;
    }
    return out;
  });
  console.log(JSON.stringify(chain, null, 2));
  await b.close();
})();
