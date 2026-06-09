const { chromium } = require('playwright');
(async () => {
  const url = process.argv[2] || 'http://localhost:3001/bg';
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await p.waitForTimeout(2500);
  const info = await p.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[aria-label="Количка"]'));
    return links.map((l) => {
      const a = l.closest('a,button') || l;
      const r = a.getBoundingClientRect();
      const sp = l.querySelector('span');
      const sr = sp ? sp.getBoundingClientRect() : null;
      const cs = sp ? getComputedStyle(sp) : null;
      return {
        circle: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        visible: r.width > 0,
        badgeXY: sr ? { x: Math.round(sr.x), y: Math.round(sr.y) } : null,
        badgeBg: cs ? cs.backgroundColor : null,
        badgeRing: cs ? cs.boxShadow : null,
      };
    });
  });
  console.log('cart', JSON.stringify(info, null, 2));
  const vis = info.find((i) => i.visible);
  if (vis) {
    const c = vis.circle;
    await p.screenshot({ path: 'tools/output/qa-r3/local-cart-desktop2.png', clip: { x: Math.max(0, c.x - 30), y: Math.max(0, c.y - 30), width: c.w + 90, height: c.h + 90 } });
  }
  const arrowBg = await p.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Предишно"]');
    if (!btn) return null;
    const cs = getComputedStyle(btn);
    const svg = btn.querySelector('svg');
    const scs = svg ? getComputedStyle(svg) : null;
    return {
      btnBg: cs.backgroundColor, btnBorder: cs.borderTopWidth + ' ' + cs.borderStyle + ' ' + cs.borderColor,
      btnRadius: cs.borderRadius, btnPadding: cs.padding,
      svgStroke: scs ? scs.stroke : null, svgFill: scs ? scs.fill : null, svgColor: scs ? scs.color : null,
      svgW: scs ? scs.width : null, svgH: scs ? scs.height : null,
    };
  });
  console.log('arrowBtn', JSON.stringify(arrowBg, null, 2));
  await b.close();
})();
