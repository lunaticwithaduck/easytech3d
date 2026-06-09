/* Arbitrary clip screenshot: node tools/verify/clip.cjs <url> <outPath> <y> <height> [width] */
const { chromium } = require('playwright');
(async () => {
  const [, , url, outPath, y, height, width] = process.argv;
  const w = width ? parseInt(width) : 1440;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(3500);
  // ensure full page rendered by scrolling
  await page.evaluate(async () => {
    await new Promise((res) => {
      let total = 0; const step = 600;
      const t = setInterval(() => { window.scrollBy(0, step); total += step; if (total > document.body.scrollHeight) { clearInterval(t); res(); } }, 50);
    });
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);
  await page.screenshot({ path: outPath, clip: { x: 0, y: parseInt(y), width: w, height: parseInt(height) } });
  await browser.close();
  console.log('wrote ' + outPath);
})();
