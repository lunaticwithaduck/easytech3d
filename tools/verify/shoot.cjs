/* Free-roam inspection helper for the localhost-vs-live comparison.
 *
 * A verification agent drives this for ANY url it chooses (localhost or https://easytech3d.com):
 *   node tools/verify/shoot.cjs <url> <outBase> [selector ...]
 *
 * It writes <outBase>-desktop.png and <outBase>-mobile.png (full page) and prints a JSON blob to
 * stdout with: page title, computed styles for key selectors (or the ones passed), and a sample of
 * in-page links so the agent can decide where to roam next. The agent reads the PNGs (image-capable)
 * and reasons about divergences — it is NOT a fixed test; the agent picks routes and what to inspect.
 */
const { chromium, devices } = require('playwright');

const DEFAULT_SELECTORS = [
  'body',
  '.announcement-bar',
  '.site-header, header',
  '.site-nav, .nav-bar',
  'h1',
  'h2',
  '.btn--primary, .btn.btn--primary',
  '.product-card',
  '.product-card__title',
  '.price-item, .price',
  '.site-footer, footer',
];

const PICK = [
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'color',
  'background-color',
  'border-radius',
  'padding',
  'margin',
  'letter-spacing',
  'text-transform',
  'display',
];

(async () => {
  const [, , url, outBase, ...rest] = process.argv;
  if (!url || !outBase) {
    console.error('usage: node tools/verify/shoot.cjs <url> <outBase> [selector ...]');
    process.exit(1);
  }
  const selectors = rest.length ? rest : DEFAULT_SELECTORS;
  const browser = await chromium.launch();
  const out = { url };
  try {
    // ---- desktop ----
    const ctxD = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const pD = await ctxD.newPage();
    await pD.goto(url, { waitUntil: 'load', timeout: 60000 }).catch((e) => (out.gotoError = e.message));
    await pD.waitForTimeout(3000); // fonts + CDN images settle
    out.title = await pD.title().catch(() => null);
    out.styles = await pD
      .evaluate(
        ({ sels, pick }) => {
          const res = {};
          for (const s of sels) {
            const el = document.querySelector(s);
            if (!el) {
              res[s] = null;
              continue;
            }
            const cs = getComputedStyle(el);
            const o = {};
            pick.forEach((p) => (o[p] = cs.getPropertyValue(p)));
            res[s] = o;
          }
          return res;
        },
        { sels: selectors, pick: PICK },
      )
      .catch((e) => ({ evalError: e.message }));
    out.links = await pD
      .evaluate(() =>
        Array.from(document.querySelectorAll('a[href]'))
          .map((a) => a.getAttribute('href'))
          .filter((h) => h && !h.startsWith('#') && !h.startsWith('javascript'))
          .filter((v, i, arr) => arr.indexOf(v) === i)
          .slice(0, 80),
      )
      .catch(() => []);
    await pD.screenshot({ path: `${outBase}-desktop.png`, fullPage: true }).catch((e) => (out.shotError = e.message));
    await ctxD.close();

    // ---- mobile ----
    const ctxM = await browser.newContext({ ...devices['iPhone 12'] });
    const pM = await ctxM.newPage();
    await pM.goto(url, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
    await pM.waitForTimeout(3000);
    await pM.screenshot({ path: `${outBase}-mobile.png`, fullPage: true }).catch(() => {});
    await ctxM.close();
  } catch (e) {
    out.error = e.message;
  }
  await browser.close();
  console.log(JSON.stringify(out, null, 2));
})();
