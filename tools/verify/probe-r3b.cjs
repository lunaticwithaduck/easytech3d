const { chromium } = require('playwright');
(async () => {
  const url = process.argv[2];
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(3500);
  const data = await p.evaluate(() => {
    const out = {};
    // For each h2 that is a section heading (46.8px or its section), find preceding eyebrow sibling
    const sectionEyebrows = [];
    document.querySelectorAll('h2').forEach(h => {
      const cs = getComputedStyle(h);
      // skip the giant decorative ones
      // look at previous element sibling within parent
      let prev = h.previousElementSibling;
      if (prev) {
        const pcs = getComputedStyle(prev);
        sectionEyebrows.push({
          heading: h.textContent.trim().slice(0,30),
          headingSize: cs.fontSize,
          eyebrowText: prev.textContent.trim().slice(0,30),
          eyebrowColor: pcs.color,
          eyebrowTransform: pcs.textTransform,
          eyebrowSize: pcs.fontSize,
        });
      }
    });
    out.sectionEyebrows = sectionEyebrows;

    // icons-with-text: find "Защо да купувате" section, inspect its blocks
    const why = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Защо'));
    if (why) {
      let sec = why.closest('section');
      const blocks = sec ? Array.from(sec.querySelectorAll('div')).filter(d => d.querySelector('svg')) : [];
      // get the immediate flex block: find blocks whose computed flex-direction
      const rows = [];
      sec && sec.querySelectorAll('div').forEach(d => {
        const cs = getComputedStyle(d);
        if (cs.display === 'flex' && d.querySelector('svg') && d.querySelector('h3, h4')) {
          rows.push({ flexDirection: cs.flexDirection, alignItems: cs.alignItems });
        }
      });
      // grid container
      let gridInfo = null;
      sec && sec.querySelectorAll('div').forEach(d => {
        const cs = getComputedStyle(d);
        if (cs.display === 'grid' && d.querySelector('svg')) {
          gridInfo = { gridTemplateColumns: cs.gridTemplateColumns };
        }
      });
      out.iconsWithText = { blockFlex: rows, grid: gridInfo, sectionRect: sec ? sec.getBoundingClientRect().width : null };
    }

    return out;
  });
  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
