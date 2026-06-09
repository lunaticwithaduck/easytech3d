/* Clean shoot: aggressively remove popups/overlays, screenshot a target section. */
const { chromium, devices } = require('playwright');

async function nuke(page) {
  await page.evaluate(() => {
    const kill = (el) => el && el.parentNode && el.parentNode.removeChild(el);
    // common overlay containers
    document.querySelectorAll('[class*="popup"],[class*="modal"],[id*="popup"],[class*="overlay"],[class*="klaviyo"],[class*="newsletter-modal"],dialog,[role="dialog"],.shopify-pc__banner,#shopify-pc__banner').forEach((e)=>{
      const st = getComputedStyle(e);
      if (st.position === 'fixed' || st.position === 'absolute' || e.tagName === 'DIALOG' || e.getAttribute('role')==='dialog') kill(e);
    });
    // remove body scroll locks
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    document.body.classList.remove('overflow-hidden','modal-open','no-scroll');
  }).catch(()=>{});
}

(async () => {
  const [, , url, outBase, selector] = process.argv;
  const browser = await chromium.launch();
  // desktop
  const ctxD = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const pD = await ctxD.newPage();
  await pD.goto(url, { waitUntil: 'load', timeout: 60000 }).catch(()=>{});
  await pD.waitForTimeout(2500);
  await nuke(pD); await pD.waitForTimeout(400); await nuke(pD);
  if (selector) {
    const el = await pD.$(selector);
    if (el) await el.screenshot({ path: `${outBase}-desktop.png` }).catch(()=>{});
    else await pD.screenshot({ path: `${outBase}-desktop.png`, fullPage: true }).catch(()=>{});
  } else {
    await pD.screenshot({ path: `${outBase}-desktop.png`, fullPage: true }).catch(()=>{});
  }
  await ctxD.close();
  // mobile
  const ctxM = await browser.newContext({ ...devices['iPhone 12'] });
  const pM = await ctxM.newPage();
  await pM.goto(url, { waitUntil: 'load', timeout: 60000 }).catch(()=>{});
  await pM.waitForTimeout(2500);
  await nuke(pM); await pM.waitForTimeout(400); await nuke(pM);
  await pM.screenshot({ path: `${outBase}-mobile.png`, fullPage: true }).catch(()=>{});
  await ctxM.close();
  await browser.close();
  console.log('done ' + url);
})();
