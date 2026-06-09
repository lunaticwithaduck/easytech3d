const { chromium, devices } = require('playwright');
(async () => {
  const url = process.argv[2] || 'http://localhost:3001/bg';
  const base = process.argv[3] || 'tools/output/qa-r3/local';
  const b = await chromium.launch();

  // --- desktop mega-menu: hover "Филаменти" ---
  const ctxD = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const pD = await ctxD.newPage();
  await pD.goto(url, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await pD.waitForTimeout(2500);
  // find the nav link whose text includes ФИЛАМЕНТИ
  const fil = pD.locator('header nav a', { hasText: 'ФИЛАМЕНТИ' }).first();
  try {
    await fil.hover({ timeout: 5000 });
    await pD.waitForTimeout(700);
  } catch (e) { /* ignore */ }
  await pD.screenshot({ path: `${base}-megamenu.png`, clip: { x: 0, y: 0, width: 1440, height: 600 } }).catch(() => {});
  await ctxD.close();

  // --- mobile drawer: open ---
  const ctxM = await b.newContext({ ...devices['iPhone 12'] });
  const pM = await ctxM.newPage();
  await pM.goto(url, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await pM.waitForTimeout(2500);
  const burger = pM.locator('button[aria-label="Навигация"], button[aria-controls="MobileNav"], [aria-label*="меню" i]').first();
  let opened = false;
  try {
    await burger.click({ timeout: 5000 });
    opened = true;
    await pM.waitForTimeout(800);
  } catch (e) { /* try a hamburger fallback */ }
  await pM.screenshot({ path: `${base}-drawer-mobile.png`, fullPage: false }).catch(() => {});
  // drill into a submenu (tap Филаменти branch) if present
  let drilled = false;
  try {
    const branch = pM.locator('#MobileNav button', { hasText: 'Филаменти' }).first();
    if (await branch.count()) {
      await branch.click({ timeout: 3000 });
      drilled = true;
      await pM.waitForTimeout(700);
      await pM.screenshot({ path: `${base}-drawer-sub-mobile.png`, fullPage: false }).catch(() => {});
    }
  } catch (e) { /* ignore */ }
  await ctxM.close();
  await b.close();
  console.log(JSON.stringify({ url, opened, drilled }));
})();
