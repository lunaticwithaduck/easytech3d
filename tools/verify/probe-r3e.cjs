const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto('http://localhost:3001/bg', { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(3000);
  const d = await p.evaluate(() => {
    const b = document.querySelector('[data-section-type=featured-products] button[aria-pressed=true]');
    const cs = getComputedStyle(b);
    return {
      borderTop: cs.borderTopWidth+' '+cs.borderTopStyle,
      borderRight: cs.borderRightWidth+' '+cs.borderRightStyle,
      borderBottom: cs.borderBottomWidth+' '+cs.borderBottomStyle+' '+cs.borderBottomColor,
      borderLeft: cs.borderLeftWidth+' '+cs.borderLeftStyle,
      outline: cs.outlineWidth+' '+cs.outlineStyle+' '+cs.outlineColor,
      boxShadow: cs.boxShadow,
    };
  });
  console.log(JSON.stringify(d,null,2));
  await browser.close();
})();
