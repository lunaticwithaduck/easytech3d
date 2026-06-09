const { chromium } = require('playwright');
(async () => {
  const url = process.argv[2];
  const sel = process.argv[3] || '.prose';
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(2000);
  const res = await p.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return { error: 'no element ' + sel };
    const cs = getComputedStyle(el);
    const root = getComputedStyle(document.documentElement);
    const bodyCs = getComputedStyle(document.body);
    // Walk up to find where --color-ink resolves
    let inkChain = [];
    let node = el;
    while (node) {
      const v = getComputedStyle(node).getPropertyValue('--color-ink').trim();
      inkChain.push((node.tagName||'') + (node.className? '.'+String(node.className).slice(0,30):'') + ' => [' + v + ']');
      node = node.parentElement;
    }
    return {
      proseColor: cs.color,
      proseColorVar: cs.getPropertyValue('--color-ink').trim(),
      rootInk: root.getPropertyValue('--color-ink').trim(),
      bodyColor: bodyCs.color,
      bodyInk: bodyCs.getPropertyValue('--color-ink').trim(),
      inkChain,
    };
  }, sel);
  console.log(JSON.stringify(res, null, 1));
  // also list stylesheets that mention --color-ink or .prose color
  const sheets = await p.evaluate(() => {
    const out = [];
    for (const ss of document.styleSheets) {
      let href = ss.href || 'inline';
      try {
        for (const rule of ss.cssRules) {
          const t = rule.cssText || '';
          if (/\.prose\b/.test(t) && /color/.test(t)) out.push({href, rule: t.slice(0,160)});
          if (/--color-ink/.test(t)) out.push({href, rule: t.slice(0,160)});
        }
      } catch(e) { out.push({href, err: 'cors'}); }
    }
    return out.slice(0,40);
  });
  console.log('--- RULES ---');
  console.log(JSON.stringify(sheets, null, 1));
  await browser.close();
})();
