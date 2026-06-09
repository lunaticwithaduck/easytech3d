const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto(process.argv[2], { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await p.waitForTimeout(3000);
  const r = await p.evaluate(() => {
    const g = (el) => (el ? { op: getComputedStyle(el).opacity, vis: getComputedStyle(el).visibility, h: Math.round(el.getBoundingClientRect().height), cls: el.className } : null);
    return {
      slider: g(document.querySelector('.AnnouncementBar__Slider')),
      content: g(document.querySelector('.AnnouncementBar__Content')),
      barEl: g(document.querySelector('.AnnouncementBar')),
      blocks: document.querySelectorAll('.AnnouncementBar__Content').length,
      flickity: !!document.querySelector('.flickity-enabled'),
    };
  });
  console.log(JSON.stringify(r, null, 2));
  await b.close();
})();
