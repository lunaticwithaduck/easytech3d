const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto('https://easytech3d.com/collections/abs', { waitUntil: 'load', timeout: 60000 }).catch(()=>{});
  await p.waitForTimeout(4000);
  const r = await p.evaluate(() => {
    const pick = (el) => el ? { h: Math.round(el.getBoundingClientRect().height), w: Math.round(el.getBoundingClientRect().width) } : null;
    const card = document.querySelector('.product-card, .product-item-block');
    const img = document.querySelector('.product-card__image, .product-card__image-wrapper, .grid-view-item__image');
    const imgWrap = document.querySelector('.product-card__image-with-placeholder-wrapper, .product-item--media');
    const btn = document.querySelector('.product-card .btn--primary, .product-form__cart-submit, .product-item__action-list .btn');
    const cs = btn ? getComputedStyle(btn) : null;
    return {
      card: pick(card), imageEl: pick(img), imageWrap: pick(imgWrap),
      button: pick(btn), buttonPad: cs ? cs.padding : null, buttonFont: cs ? cs.fontSize : null, buttonLH: cs ? cs.lineHeight : null,
    };
  });
  console.log(JSON.stringify(r, null, 2));
  await b.close();
})();
