/* Section-clipped screenshots for close visual comparison.
 * node tools/verify/crop.cjs <url> <outBase> <tag>
 * Captures viewport-top (announcement+header+hero) and named sections.
 */
const { chromium } = require('playwright');

(async () => {
  const [, , url, outBase] = process.argv;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const out = { url, shots: [] };
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 60000 }).catch((e) => (out.gotoError = e.message));
    await page.waitForTimeout(3500);

    // Top of page: announcement bar + header + hero (first 1100px)
    await page.screenshot({ path: `${outBase}-top.png`, clip: { x: 0, y: 0, width: 1440, height: 1100 } });
    out.shots.push('top');

    // Try to grab section info: tag, classes, bounding box, bg color, text
    const sections = await page.evaluate(() => {
      const pick = (el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return {
          tag: el.tagName.toLowerCase(),
          cls: (el.className && typeof el.className === 'string' ? el.className : '').slice(0, 120),
          y: Math.round(r.top + window.scrollY),
          h: Math.round(r.height),
          bg: cs.backgroundColor,
          color: cs.color,
          text: (el.innerText || '').replace(/\s+/g, ' ').slice(0, 80),
        };
      };
      // Top-level structural blocks inside main
      const main = document.querySelector('main') || document.body;
      const kids = Array.from(main.children).map(pick);
      const header = document.querySelector('header');
      const footer = document.querySelector('footer');
      const announce = document.querySelector('[class*="announce" i], [class*="announcement" i]');
      return {
        header: header ? pick(header) : null,
        announce: announce ? pick(announce) : null,
        footer: footer ? pick(footer) : null,
        mainChildren: kids,
      };
    });
    out.sections = sections;
  } catch (e) {
    out.error = e.message;
  }
  await browser.close();
  console.log(JSON.stringify(out, null, 2));
})();
