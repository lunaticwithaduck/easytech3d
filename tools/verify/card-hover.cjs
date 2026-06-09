const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto('http://localhost:3001/bg/collections/abs', { waitUntil: 'load', timeout: 45000 });
  await p.waitForTimeout(2500);
  const h = await p.evaluate(() => {
    const card = document.querySelector('.group.rounded-card');
    return card ? Math.round(card.getBoundingClientRect().height) : null;
  });
  console.log('local product-card height:', h, '(live = 535)');
  const firstCard = p.locator('.group.rounded-card').first();
  await firstCard.scrollIntoViewIfNeeded();
  await firstCard.hover();
  await p.waitForTimeout(800);
  const op = await p.evaluate(() => {
    const card = document.querySelector('.group.rounded-card');
    const imgs = card ? card.querySelectorAll('img') : [];
    return Array.from(imgs).slice(0,2).map(i => +getComputedStyle(i).opacity);
  });
  console.log('on hover [primary, alternate] opacity:', JSON.stringify(op), '(want [0,1])');
  await firstCard.screenshot({ path: 'tools/output/verify-shots/card-hover.png' });
  await b.close();
})();
