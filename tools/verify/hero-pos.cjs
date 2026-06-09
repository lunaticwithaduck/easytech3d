const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1600, height: 800 } });
  const p = await ctx.newPage();
  await p.goto('https://easytech3d.com/', { waitUntil: 'load', timeout: 60000 }).catch(()=>{});
  await p.waitForTimeout(4000);
  const r = await p.evaluate(() => {
    const out = {};
    const title = document.querySelector('.slideshow__title, .slideshow .h1, [class*="slideshow"] h2, .slideshow__text-content .h1');
    if (title) { const b = title.getBoundingClientRect(); out.title = { sel: title.className, text: (title.textContent||'').trim().slice(0,16), left: Math.round(b.left), top: Math.round(b.top), w: Math.round(b.width), fs: getComputedStyle(title).fontSize }; }
    // the container that holds the slideshow text
    const wrap = document.querySelector('.slideshow__text-wrapper, .slideshow__text-content, .page-width-small, .slideshow .page-width');
    if (wrap) { const b = wrap.getBoundingClientRect(); out.wrap = { cls: wrap.className.slice(0,60), left: Math.round(b.left), w: Math.round(b.width) }; }
    return out;
  });
  console.log('LIVE @1600:', JSON.stringify(r, null, 2));
  await b.close();
})();
