/* Custom geometry probe: dismisses overlays, captures bounding boxes + grid metrics. */
const { chromium, devices } = require('playwright');

async function dismiss(page) {
  // try common cookie/popup close buttons
  const sels = [
    'button:has-text("Accept")', 'button:has-text("Приемам")', 'button:has-text("Decline")',
    '[aria-label="Close"]', '.needsclick.klaviyo-close-form', 'button.close', '.modal__close',
    'button[aria-label="Close dialog"]', '#shopify-pc__banner__btn-accept',
  ];
  for (const s of sels) {
    try { const el = await page.$(s); if (el) { await el.click({ timeout: 800 }).catch(()=>{}); } } catch {}
  }
  // klaviyo iframes
  try {
    for (const f of page.frames()) {
      const btn = await f.$('button[aria-label="Close dialog"], .klaviyo-close-form, button.needsclick');
      if (btn) await btn.click({ timeout: 800 }).catch(()=>{});
    }
  } catch {}
  await page.waitForTimeout(500);
}

(async () => {
  const [, , url, outBase, probeJson] = process.argv;
  const probes = probeJson ? JSON.parse(probeJson) : [];
  const browser = await chromium.launch();
  const out = { url, desktop: {}, mobile: {} };
  // desktop
  const ctxD = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const pD = await ctxD.newPage();
  await pD.goto(url, { waitUntil: 'load', timeout: 60000 }).catch((e)=>out.gotoError=e.message);
  await pD.waitForTimeout(2500);
  await dismiss(pD);
  await pD.waitForTimeout(800);
  out.desktop = await pD.evaluate((probes) => {
    const r = {};
    for (const p of probes) {
      const els = Array.from(document.querySelectorAll(p.sel)).slice(0, p.limit || 6);
      r[p.name] = els.map((el) => {
        const b = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return {
          x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height),
          right: Math.round(b.right), cx: Math.round(b.x + b.width/2),
          textAlign: cs.textAlign, justifyContent: cs.justifyContent, alignItems: cs.alignItems,
          display: cs.display, gridTemplateColumns: cs.gridTemplateColumns, gap: cs.gap,
          padding: cs.padding, margin: cs.margin, maxWidth: cs.maxWidth, width: cs.width,
        };
      });
    }
    r._viewportW = window.innerWidth;
    r._scrollW = document.documentElement.scrollWidth;
    return r;
  }, probes).catch((e)=>({evalError:e.message}));
  await pD.screenshot({ path: `${outBase}-desktop.png`, fullPage: true }).catch(()=>{});
  await ctxD.close();
  // mobile
  const ctxM = await browser.newContext({ ...devices['iPhone 12'] });
  const pM = await ctxM.newPage();
  await pM.goto(url, { waitUntil: 'load', timeout: 60000 }).catch(()=>{});
  await pM.waitForTimeout(2500);
  await dismiss(pM);
  await pM.waitForTimeout(800);
  out.mobile = await pM.evaluate((probes) => {
    const r = {};
    for (const p of probes) {
      const els = Array.from(document.querySelectorAll(p.sel)).slice(0, p.limit || 6);
      r[p.name] = els.map((el) => {
        const b = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), cx: Math.round(b.x+b.width/2), textAlign: cs.textAlign, gridTemplateColumns: cs.gridTemplateColumns, gap: cs.gap };
      });
    }
    r._viewportW = window.innerWidth;
    r._scrollW = document.documentElement.scrollWidth;
    return r;
  }, probes).catch((e)=>({evalError:e.message}));
  await pM.screenshot({ path: `${outBase}-mobile.png`, fullPage: true }).catch(()=>{});
  await ctxM.close();
  await browser.close();
  console.log(JSON.stringify(out, null, 2));
})();
