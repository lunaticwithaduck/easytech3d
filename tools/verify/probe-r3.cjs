const { chromium } = require('playwright');
(async () => {
  const url = process.argv[2];
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(3500);
  const data = await p.evaluate(() => {
    const out = {};
    // all section h2 headings with text + size + color
    out.h2s = Array.from(document.querySelectorAll('h2')).map(h => {
      const cs = getComputedStyle(h);
      return { text: h.textContent.trim().slice(0,40), fontSize: cs.fontSize, color: cs.color, fontWeight: cs.fontWeight };
    });
    // eyebrows: small uppercase spans near headings - find spans with text-transform uppercase
    out.eyebrows = Array.from(document.querySelectorAll('span, p, div')).filter(el => {
      const cs = getComputedStyle(el);
      return cs.textTransform === 'uppercase' && el.textContent.trim().length>2 && el.textContent.trim().length<60 && el.children.length===0;
    }).slice(0,12).map(el => {
      const cs = getComputedStyle(el);
      return { text: el.textContent.trim().slice(0,40), color: cs.color, fontSize: cs.fontSize };
    });
    return out;
  });
  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
