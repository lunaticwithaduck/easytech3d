const { chromium } = require('playwright');
(async () => {
  const url = process.argv[2];
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(2000);
  const res = await p.evaluate(() => {
    const proses = [...document.querySelectorAll('.prose')];
    return proses.map((el, i) => {
      const cs = getComputedStyle(el);
      // find owning section text
      return {
        idx: i,
        classes: String(el.className).slice(0,60),
        color: cs.color,
        text: (el.textContent||'').trim().slice(0,40),
        rectTop: Math.round(el.getBoundingClientRect().top),
        // matched rules via inline check is hard; report color
      };
    });
  });
  console.log(JSON.stringify(res, null, 1));
  // The policy body prose: find one whose text contains "30-дневна" or longer body
  const bodyProse = await p.evaluate(() => {
    const el = [...document.querySelectorAll('.prose')].find(e => (e.textContent||'').includes('30-дневна') || (e.textContent||'').length > 50);
    if (!el) return {none:true};
    const cs = getComputedStyle(el);
    return { color: cs.color, text:(el.textContent||'').slice(0,60) };
  });
  console.log('BODY PROSE:', JSON.stringify(bodyProse));
  await browser.close();
})();
