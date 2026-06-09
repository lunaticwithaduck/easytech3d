const { chromium, devices } = require('playwright');
(async () => {
  const [, , url, out, openMenu] = process.argv;
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 12'] });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await p.waitForTimeout(3000);
  if (openMenu) {
    // try common hamburger selectors
    const sels = ['button[aria-label*="enu" i]', '.mobile-nav-trigger', '.header__icon--menu', '[aria-controls*="enu" i]', '.site-header__menu', 'button.menu', '.hamburger'];
    for (const s of sels) {
      const el = p.locator(s).first();
      if (await el.count()) { await el.click().catch(() => {}); await p.waitForTimeout(1000); break; }
    }
    await p.screenshot({ path: out, fullPage: false });
  } else {
    await p.screenshot({ path: out, clip: { x: 0, y: 0, width: 390, height: 220 } });
  }
  await b.close();
  console.log('done ' + out);
})();
