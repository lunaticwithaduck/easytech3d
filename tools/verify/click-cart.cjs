const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:3001/bg', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(2000);
  const before = await page.locator('#sidebar-cart').evaluate(el => getComputedStyle(el).transform);
  await page.locator('button[aria-label="Количка"]:visible').first().click();
  await page.waitForTimeout(800);
  const after = await page.locator('#sidebar-cart').evaluate(el => getComputedStyle(el).transform);
  const overlay = await page.locator('#sidebar-cart').evaluate(() => {
    const o = document.querySelector('.fixed.inset-0'); return o ? getComputedStyle(o).opacity : 'none';
  });
  await page.screenshot({ path: 'tools/output/verify-shots/cart-open.png' });
  console.log('transform before(closed):', before);
  console.log('transform after(open):  ', after);
  console.log('overlay opacity:', overlay);
  await browser.close();
})();
