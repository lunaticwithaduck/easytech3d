/**
 * Coverage gap-check. Pulls internal links from the server-rendered hub pages (home,
 * collection list, blog index) and diffs them against the captured route set, so we can
 * prove no nav/footer-linked content page is missing from what we gathered.
 *
 *   node scripts/gap-check.cjs
 */
const fs = require('node:fs');
const path = require('node:path');

const BASE = 'https://www.easytech3d.com/';
const UA = { headers: { 'user-agent': 'Mozilla/5.0 (compatible; easytech3d-mirror/1.0)' } };
const SKIP_EXT = /\.(pdf|jpg|jpeg|png|gif|svg|webp|zip|mp4|webm|mp3|css|js|ico|xml|json|woff2?|ttf)(\?|$)/i;
const SKIP_PATH = /^\/(cart|checkout|checkouts|account|orders|search|services|apps|cdn|tools)(\/|$)|\/(login|register|logout)(\/|$)/i;

function norm(href) {
  try {
    const u = new URL(href, BASE);
    if (u.origin !== new URL(BASE).origin) return null;
    if (SKIP_EXT.test(u.pathname)) return null;
    if (SKIP_PATH.test(u.pathname)) return null;
    u.hash = '';
    u.search = '';
    return u.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}
function classify(p) {
  if (p === '/' || p === '') return 'home';
  if (/\/products\//.test(p)) return 'product';
  if (/\/collections\//.test(p)) return 'collection';
  if (/\/blogs\//.test(p)) return 'blog';
  if (/\/pages\//.test(p)) return 'page';
  if (/\/policies\//.test(p)) return 'policy';
  return 'other';
}

(async () => {
  const hubs = [BASE, BASE + 'collections', BASE + 'collections/all', BASE + 'blogs/3д-принтове'];
  const found = new Set();
  for (const h of hubs) {
    try {
      const html = await (await fetch(h, UA)).text();
      const re = /href\s*=\s*["']([^"']+)["']/gi;
      let m;
      while ((m = re.exec(html)) !== null) {
        const n = norm(m[1]);
        if (n) found.add(n);
      }
    } catch (e) {
      console.log('hub fail', h, e.message);
    }
  }

  // Canonical key = decoded, lower-cased, trailing-slash-stripped pathname. Matches across the
  // percent-encoded route URLs and the literal-Cyrillic hrefs in the HTML.
  const canon = (u) => { try { return decodeURIComponent(new URL(u).pathname).replace(/\/$/, '').toLowerCase(); } catch { return u; } };
  const routeKeys = new Set(require(path.resolve(__dirname, '..', 'output', 'reference', 'routes.json')).routes.map((r) => canon(r.url)));
  const dec = (u) => decodeURIComponent(u.replace(BASE.replace(/\/$/, ''), '')) || '/';

  // A link counts as a real, capture-worthy CONTENT page only if it's a content type we mirror
  // and isn't theme noise (tag views, .atom feeds, tab-fragments, Liquid-error strings, auth).
  const NOISE = /\/tagged\/|\/tab[_-]|[()]|\s|\.atom$|\/customer_authentication\//i;
  const isContent = (u) => {
    const pn = new URL(u).pathname;
    if (NOISE.test(u) || NOISE.test(pn)) return false;
    const t = classify(pn);
    return ['page', 'collection', 'blog', 'policy'].includes(t) || pn === '/collections';
  };

  const byType = {};
  const realMissing = [];
  const noiseMissing = [];
  for (const u of found) {
    const t = classify(new URL(u).pathname);
    byType[t] = (byType[t] || 0) + 1;
    if (routeKeys.has(canon(u))) continue;           // already captured
    if (t === 'product') continue;                    // products are deliberately sampled
    if (isContent(u)) realMissing.push({ t, u: dec(u) });
    else noiseMissing.push({ t, u: dec(u) });
  }

  console.log('Links discovered from hub pages:', found.size);
  console.log('By type:', JSON.stringify(byType));

  console.log('\n=== Real non-product CONTENT pages linked but NOT captured ===');
  if (!realMissing.length) {
    console.log('(none — every linked non-product content page is captured)');
  } else {
    const grouped = {};
    for (const m of realMissing) (grouped[m.t] = grouped[m.t] || []).push(m.u);
    for (const t of Object.keys(grouped).sort()) {
      console.log(`[${t}] (${grouped[t].length})`);
      grouped[t].sort().forEach((u) => console.log('   ', u));
    }
  }
  console.log(`\n(ignored as noise/feeds/fragments: ${noiseMissing.length}; products excluded by design)`);

  console.log('\nSUMMARY: ' + (realMissing.length === 0
    ? 'PASS — no non-product content page is missing. Coverage of linked pages is complete.'
    : `${realMissing.length} non-product content page(s) linked but not captured (listed above).`));

  fs.writeFileSync(
    path.resolve(__dirname, '..', 'output', 'reference', 'gap-check.json'),
    JSON.stringify({ checkedAt: new Date().toISOString(), hubs, found: found.size, byType, realMissing, noiseMissing }, null, 2),
  );
})();
