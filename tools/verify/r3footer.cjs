const { chromium } = require('playwright');
(async () => {
  const url = process.argv[2];
  const outPath = process.argv[3];
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await p.waitForTimeout(3000);
  const footer = p.locator('footer').first();
  await footer.scrollIntoViewIfNeeded().catch(() => {});
  await p.waitForTimeout(800);
  await footer.screenshot({ path: outPath }).catch(async (e) => {
    console.log('elShotErr', e.message);
  });
  await b.close();
  console.log('wrote ' + outPath);
})();
