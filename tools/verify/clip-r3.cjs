const { chromium } = require('playwright');
(async () => {
  const [, , url, outBase, sel] = process.argv;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'load', timeout: 60000 }).catch(()=>{});
  await page.waitForTimeout(3000);
  const el = page.locator(sel).first();
  if (await el.count()) {
    await el.scrollIntoViewIfNeeded().catch(()=>{});
    await page.waitForTimeout(600);
    await el.screenshot({ path: `${outBase}.png` }).catch(e => console.log('shot err', e.message));
    console.log('captured', outBase);
  } else { console.log('NOT FOUND', sel); }
  await browser.close();
})();
