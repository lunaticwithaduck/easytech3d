const { chromium } = require('playwright');
(async () => {
  const url = process.argv[2];
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto(url, { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(3500);
  const data = await p.evaluate(() => {
    return Array.from(document.querySelectorAll('.collection-grid-item img')).slice(0, 8).map((im) => ({
      src: (im.currentSrc || im.src).slice(0, 120),
      nw: im.naturalWidth, nh: im.naturalHeight, alt: im.alt,
    }));
  });
  console.log(JSON.stringify(data, null, 2));
  await b.close();
})();
