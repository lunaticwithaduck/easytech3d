const { chromium } = require('playwright');
(async () => {
  const url = process.argv[2];
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(3500);
  const data = await p.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('[data-section-type=featured-products]'));
    return sections.map((sec, i) => {
      const h2 = sec.querySelector('h2');
      // tab buttons
      const tabs = Array.from(sec.querySelectorAll('button[aria-pressed]')).map(b => {
        const cs = getComputedStyle(b);
        return {
          text: b.textContent.trim().slice(0,20),
          pressed: b.getAttribute('aria-pressed'),
          borderBottom: cs.borderBottomWidth + ' ' + cs.borderBottomColor,
          opacity: cs.opacity,
        };
      });
      // active track: visible card row -> measure first row cards count by y position
      const visibleTrack = Array.from(sec.querySelectorAll('div')).find(d => {
        const cs = getComputedStyle(d);
        return cs.display === 'flex' && cs.overflowX === 'auto' && d.querySelector('a');
      });
      let cardWidths = [];
      let containerWidth = null;
      if (visibleTrack) {
        containerWidth = visibleTrack.clientWidth;
        cardWidths = Array.from(visibleTrack.children).slice(0,6).map(c => Math.round(c.getBoundingClientRect().width));
      }
      // estimate cards per viewport
      const perRow = (containerWidth && cardWidths[0]) ? +(containerWidth / cardWidths[0]).toFixed(2) : null;
      return {
        index: i,
        heading: h2 ? h2.textContent.trim().slice(0,30) : null,
        tabs,
        containerWidth,
        cardWidths,
        approxPerRow: perRow,
      };
    });
  });
  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
