/* Round-3 focused probe.
 * node tools/verify/r3probe.cjs <url> <outBase>
 * Captures element-clipped shots of the cart badge (desktop+mobile) and the announcement bar
 * (mobile), and dumps computed styles for the badge chip + announce arrows.
 */
const { chromium, devices } = require('playwright');

async function badgeInfo(page) {
  return page.evaluate(() => {
    // The count badge is the <span> with rounded-full + ring inside the cart link.
    const cartLink = document.querySelector('a[aria-label="Количка"]');
    const out = { found: !!cartLink };
    if (!cartLink) return out;
    const badge = cartLink.querySelector('span');
    if (badge) {
      const cs = getComputedStyle(badge);
      out.badge = {
        text: (badge.innerText || badge.textContent || '').trim(),
        bg: cs.backgroundColor,
        color: cs.color,
        borderRadius: cs.borderRadius,
        boxShadow: cs.boxShadow,
        width: cs.width,
        height: cs.height,
        fontWeight: cs.fontWeight,
        fontSize: cs.fontSize,
        display: cs.display,
        position: cs.position,
      };
      const r = badge.getBoundingClientRect();
      out.badgeRect = { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
    }
    const circle = cartLink.closest('a, button') || cartLink;
    const cr = circle.getBoundingClientRect();
    out.circleRect = { x: Math.round(cr.x), y: Math.round(cr.y), w: Math.round(cr.width), h: Math.round(cr.height) };
    return out;
  });
}

async function arrowInfo(page) {
  return page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button[aria-label="Предишно"], button[aria-label="Следващо"]'));
    return btns.map((b) => {
      const cs = getComputedStyle(b);
      const r = b.getBoundingClientRect();
      return {
        label: b.getAttribute('aria-label'),
        opacity: cs.opacity,
        color: cs.color,
        visibility: cs.visibility,
        display: cs.display,
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      };
    });
  });
}

(async () => {
  const [, , url, outBase] = process.argv;
  const browser = await chromium.launch();
  const out = { url };
  try {
    // desktop
    const ctxD = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    const pD = await ctxD.newPage();
    await pD.goto(url, { waitUntil: 'load', timeout: 60000 }).catch((e) => (out.gotoError = e.message));
    await pD.waitForTimeout(3000);
    out.desktopBadge = await badgeInfo(pD).catch((e) => ({ err: e.message }));
    out.desktopArrows = await arrowInfo(pD).catch((e) => ({ err: e.message }));
    // clip around the desktop cart circle (top-right)
    if (out.desktopBadge && out.desktopBadge.circleRect) {
      const c = out.desktopBadge.circleRect;
      await pD.screenshot({
        path: `${outBase}-cart-desktop.png`,
        clip: { x: Math.max(0, c.x - 30), y: Math.max(0, c.y - 30), width: c.w + 80, height: c.h + 80 },
      }).catch(() => {});
    }
    await ctxD.close();

    // mobile
    const ctxM = await browser.newContext({ ...devices['iPhone 12'] });
    const pM = await ctxM.newPage();
    await pM.goto(url, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
    await pM.waitForTimeout(3000);
    out.mobileBadge = await badgeInfo(pM).catch((e) => ({ err: e.message }));
    out.mobileArrows = await arrowInfo(pM).catch((e) => ({ err: e.message }));
    // announce bar strip (top ~50px) on mobile, at device scale
    await pM.screenshot({ path: `${outBase}-announce-mobile.png`, clip: { x: 0, y: 0, width: 390, height: 50 } }).catch((e) => (out.aErr = e.message));
    // mobile cart cluster (top-right)
    if (out.mobileBadge && out.mobileBadge.circleRect) {
      const c = out.mobileBadge.circleRect;
      await pM.screenshot({
        path: `${outBase}-cart-mobile.png`,
        clip: { x: Math.max(0, c.x - 20), y: Math.max(0, c.y - 20), width: Math.min(390, c.w + 60), height: c.h + 50 },
      }).catch(() => {});
    }
    await ctxM.close();
  } catch (e) {
    out.error = e.message;
  }
  await browser.close();
  console.log(JSON.stringify(out, null, 2));
})();
