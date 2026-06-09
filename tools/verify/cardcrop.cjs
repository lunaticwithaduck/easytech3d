const { chromium } = require('playwright');
(async () => {
  const url = process.argv[2];
  const outPng = process.argv[3];
  const sel = process.argv[4] || '.grid__item';
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1440, height: 1100 } })).newPage();
  await p.goto(url, { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(3500);
  // dismiss cookie banner if present
  await p.evaluate(() => {
    const sels = ['#shopify-pc__banner__btn-accept', '.shopify-pc__banner__btn-accept', 'button'];
    document.querySelectorAll('.shopify-pc__banner, [class*="cookie"], [id*="cookie"]').forEach(e => e.remove());
  }).catch(()=>{});
  const info = await p.evaluate((sel) => {
    const items = Array.from(document.querySelectorAll(sel));
    return { count: items.length, classes: items[0] ? items[0].className : null,
      innerClasses: items[0] ? Array.from(items[0].querySelectorAll('*')).slice(0,40).map(e=>e.className).filter(c=>typeof c==='string'&&c) : [] };
  }, sel);
  console.log(JSON.stringify(info, null, 2));
  const el = await p.$(sel);
  if (el && outPng) await el.screenshot({ path: outPng });
  await b.close();
})();
