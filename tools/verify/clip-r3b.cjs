const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto('http://localhost:3001/bg', { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(3000);
  // get the nav containing the tabs
  const nav = p.locator('[data-section-type=featured-products] nav').first();
  await nav.scrollIntoViewIfNeeded();
  await p.waitForTimeout(400);
  await nav.screenshot({ path: '.claude/scout/qa-r3/clip-local-tabsrow.png' });
  // also computed border-top-color to know if visible
  const d = await p.evaluate(() => {
    const b = document.querySelector('[data-section-type=featured-products] button[aria-pressed=true]');
    const cs = getComputedStyle(b);
    return { btColor: cs.borderTopColor, blColor: cs.borderLeftColor, brColor: cs.borderRightColor };
  });
  console.log(JSON.stringify(d));
  await browser.close();
})();
