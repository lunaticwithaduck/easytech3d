const { chromium } = require('playwright');
(async () => {
  const url = process.argv[2];
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(3000);
  const data = await p.evaluate(() => {
    const form = document.querySelector('#Contact_newsletter, form[id*=ewsletter], #section-newsletter form');
    const out = { newsletterInputs: [] };
    const sec = document.querySelector('#section-newsletter');
    if (sec) {
      out.newsletterInputs = Array.from(sec.querySelectorAll('input:not([type=hidden])')).map(inp => ({
        type: inp.type, name: inp.name, placeholder: inp.placeholder
      }));
      const btn = sec.querySelector('button[type=submit]');
      out.submit = btn ? btn.textContent.trim() : null;
    }
    // inactive tab border-style check
    const tab = document.querySelector('[data-section-type=featured-products] button[aria-pressed=false]');
    if (tab) { const cs = getComputedStyle(tab); out.inactiveTabBorderStyle = cs.borderBottomStyle; }
    const atab = document.querySelector('[data-section-type=featured-products] button[aria-pressed=true]');
    if (atab) { const cs = getComputedStyle(atab); out.activeTabBorderStyle = cs.borderBottomStyle + ' ' + cs.borderBottomColor; }
    return out;
  });
  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
