const { chromium } = require('playwright');
const OUT = 'C:/Users/lyubomir.pacheliev_o/Documents/projects/easytech3d/tools/output/verify-shots/dsv-chrome-mobilenav';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 3 });
  const p = await ctx.newPage();
  await p.goto('http://localhost:3001/bg', { waitUntil: 'load', timeout: 60000 }).catch(()=>{});
  await p.waitForTimeout(3500);
  const els = await p.$$("[aria-label='Количка']");
  for (let i = 0; i < els.length; i++) {
    const box = await els[i].boundingBox();
    console.log(i, JSON.stringify(box));
    if (box && box.width) {
      await p.screenshot({ path: `${OUT}/local-cartcrop${i}.png`, clip: { x: box.x-16, y: box.y-16, width: box.width+32, height: box.height+32 } });
    }
  }
  await b.close();
})();
