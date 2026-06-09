const { chromium } = require('playwright');
(async () => {
  const [, , url, outBase, needle] = process.argv;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load', timeout: 60000 }).catch(()=>{});
  await p.waitForTimeout(3000);
  const handle = await p.evaluateHandle((n) => {
    const h = Array.from(document.querySelectorAll('h2')).find(x => x.textContent.includes(n));
    return h ? h.closest('section') || h.parentElement.parentElement : null;
  }, needle);
  const el = handle.asElement();
  if (el) { await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(500); await el.screenshot({ path: outBase+'.png' }); console.log('captured', outBase); }
  else console.log('NOT FOUND', needle);
  await browser.close();
})();
