const { chromium } = require('playwright');
(async () => {
  const [, , url, out, text] = process.argv;
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await p.waitForTimeout(3000);
  // find nav item containing text (e.g. ФИЛАМЕНТИ)
  const link = p.locator(`#AccessibleNav a, header a`, { hasText: text }).first();
  if (await link.count()) {
    await link.hover().catch(() => {});
    await p.waitForTimeout(1200);
  }
  await p.screenshot({ path: out, clip: { x: 0, y: 0, width: 1440, height: 700 } });
  await b.close();
  console.log('done ' + out);
})();
