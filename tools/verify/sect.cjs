/* Element-clipped screenshots by nth section + footer, after full lazy scroll.
 * node tools/verify/sect.cjs <url> <outBase> <main|shopify>
 */
const { chromium } = require('playwright');
(async () => {
  const [, , url, outBase] = process.argv;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  await page.evaluate(async () => {
    await new Promise((res) => {
      let total = 0; const step = 500;
      const t = setInterval(() => { window.scrollBy(0, step); total += step; if (total > document.body.scrollHeight + 1000) { clearInterval(t); res(); } }, 40);
    });
  });
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  // Identify candidate top-level sections inside main
  const main = page.locator('main').first();
  const candidates = await page.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    const out = [];
    Array.from(main.children).forEach((el, i) => {
      if (el.tagName === 'STYLE' || el.tagName === 'SCRIPT') return;
      const r = el.getBoundingClientRect();
      if (r.height < 40) return;
      const txt = (el.innerText || '').replace(/\s+/g, ' ').slice(0, 50);
      out.push({ i, tag: el.tagName.toLowerCase(), cls: (el.className||'').toString().slice(0,60), h: Math.round(r.height), txt });
    });
    return out;
  });
  console.log(JSON.stringify(candidates, null, 2));

  // screenshot each candidate by index path
  const kids = main.locator(':scope > *');
  const n = await kids.count();
  let shotIdx = 0;
  for (let i = 0; i < n; i++) {
    const el = kids.nth(i);
    const box = await el.boundingBox().catch(() => null);
    if (!box || box.height < 40) continue;
    const tag = await el.evaluate((e) => e.tagName);
    if (tag === 'STYLE' || tag === 'SCRIPT') continue;
    try {
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(150);
      await el.screenshot({ path: `${outBase}-s${shotIdx}.png` });
      shotIdx++;
    } catch (e) { /* skip */ }
  }
  // footer
  const f = page.locator('footer').first();
  if (await f.count()) {
    await f.scrollIntoViewIfNeeded().catch(()=>{});
    await page.waitForTimeout(200);
    await f.screenshot({ path: `${outBase}-footer.png` }).catch(()=>{});
  }
  await browser.close();
})();
