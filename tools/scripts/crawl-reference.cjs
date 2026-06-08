/**
 * Step A of the site teardown. Discover routes on easytech3d.com.
 *
 * Two discovery modes, picked automatically:
 *   1. SITEMAP (default, preferred for Shopify). Fetch /sitemap.xml, walk the nested
 *      product/collection/page/blog sub-sitemaps, and collect every URL. Categorize by
 *      type and apply per-type caps so we get full coverage of pages/collections/blogs
 *      but only a representative SAMPLE of products (you don't want 400 near-identical
 *      product screenshots in a design reference). This is the high-accuracy path.
 *   2. BFS (fallback / --bfs). Crawl the same-origin link graph from the seed up to a
 *      depth and page cap. Used when there's no sitemap or you pass --bfs.
 *
 * Emits routes.json so you can eyeball + prune before the heavier capture/mirror steps.
 *
 * Usage:
 *   node scripts/crawl-reference.cjs
 *   node scripts/crawl-reference.cjs --url=https://www.easytech3d.com/
 *   node scripts/crawl-reference.cjs --products=20 --max=120
 *   node scripts/crawl-reference.cjs --bfs --depth=3 --max=80
 *   node scripts/crawl-reference.cjs --no-sitemap        # force BFS
 */

const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

// easytech3d.com 301-redirects the apex to www — seed the canonical www host so the
// same-origin checks below don't reject every post-redirect URL.
const DEFAULT_URL = 'https://www.easytech3d.com/';
const DEFAULT_DEPTH = 3;        // BFS depth (was 2 — a little more aggressive)
const DEFAULT_MAX = 120;        // overall route cap (was 15)
const DEFAULT_PRODUCT_CAP = 16; // sitemap: max product pages to keep (sample, not every SKU)
const NAV_TIMEOUT = 30_000;
const FETCH_TIMEOUT = 20_000;

const SKIP_EXTENSIONS = /\.(pdf|jpg|jpeg|png|gif|svg|webp|zip|mp4|webm|mp3|css|js|ico|xml|json|atom|rss|woff2?|ttf)(\?|$)/i;

// Routes that are never useful as a *design* reference (cart/checkout/account funnels,
// search result pages, Shopify CDN/api endpoints). Matched against the pathname.
const SKIP_PATH = /^\/(cart|checkout|checkouts|account|orders|search|services|apps|cdn|tools|\d+\/(orders|checkouts))(\/|$)|\/(login|register|logout)(\/|$)/i;

const SKIP_QUERY = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid', 'srsltid', '_pos', '_sid', '_ss', 'variant'];

function parseArgs(argv) {
  const out = {
    url: DEFAULT_URL,
    depth: DEFAULT_DEPTH,
    max: DEFAULT_MAX,
    products: DEFAULT_PRODUCT_CAP,
    sitemap: true,   // try sitemap first
    bfs: false,      // force BFS only
    system: true,    // also include cart/search/404 system templates
    harvest: true,   // also harvest hub-page links the sitemap misses
    headed: false,
    slowmo: 0,
  };
  for (const a of argv.slice(2)) {
    if (a.startsWith('--url=')) out.url = a.slice(6);
    else if (a.startsWith('--depth=')) out.depth = Number(a.slice(8));
    else if (a.startsWith('--max=')) out.max = Number(a.slice(6));
    else if (a.startsWith('--products=')) out.products = Number(a.slice(11));
    else if (a === '--no-sitemap') out.sitemap = false;
    else if (a === '--no-system') out.system = false;
    else if (a === '--no-harvest') out.harvest = false;
    else if (a === '--bfs') { out.bfs = true; out.sitemap = false; }
    else if (a === '--headed') out.headed = true;
    else if (a.startsWith('--slowmo=')) out.slowmo = Number(a.slice(9));
  }
  return out;
}

// Harvest internal links from the server-rendered hub pages (home, /collections, blog index)
// and return any non-product CONTENT page not already in `existingUrls`. Shopify sitemaps are
// not exhaustive — they omit /policies/* and can omit pages set to noindex — so this pass is
// what guarantees we don't miss a nav/footer-linked page. Products are intentionally NOT
// harvested (they're sampled from the sitemap); obvious theme noise is filtered out.
async function harvestHubLinks(seedUrl, existingUrls, log) {
  const hubs = [
    new URL('/', seedUrl).toString(),
    new URL('/collections', seedUrl).toString(),
    new URL('/collections/all', seedUrl).toString(),
  ];
  for (const u of existingUrls) {
    if (/\/blogs\/[^/]+$/.test(new URL(u).pathname)) { hubs.push(u); break; } // blog index
  }
  const seen = new Set(existingUrls.map(canonKey));
  const NOISE = /\/tagged\/|\/tab[_-]|[()]|\s/; // tag views, theme tab-fragments, Liquid-error strings
  const added = [];
  for (const hub of hubs) {
    const html = await fetchText(hub);
    if (!html) continue;
    const re = /href\s*=\s*["']([^"']+)["']/gi;
    let m;
    while ((m = re.exec(html)) !== null) {
      const raw = m[1];
      if (NOISE.test(raw)) continue;
      const n = normalize(raw, seedUrl);
      if (!n) continue;
      const key = canonKey(n);
      if (seen.has(key)) continue;
      const pn = new URL(n).pathname;
      if (/\/tagged\//.test(pn)) continue;
      const type = classify(pn);
      const keep = ['page', 'collection', 'blog', 'policy'].includes(type) || pn === '/collections';
      if (!keep) continue; // skip products + 'other'
      seen.add(key);
      added.push({ url: n, type: pn === '/collections' ? 'collection' : type, depth: 0, source: 'harvest' });
    }
  }
  if (added.length) {
    const byType = {};
    for (const a of added) byType[a.type] = (byType[a.type] || 0) + 1;
    log(`harvest: +${added.length} linked page(s) absent from sitemap (${Object.entries(byType).map(([k, v]) => `${k}:${v}`).join(', ')})`);
  }
  return added;
}

// Distinct page TEMPLATES the sitemap omits but a 1:1 rebuild still needs: the cart, the
// search-results layout, and the themed 404. Not in the sitemap (they're not content), so
// we inject them explicitly. These bypass the SKIP_PATH denylist on purpose.
function systemRoutes(seedUrl) {
  return [
    { url: new URL('/cart', seedUrl).toString(), type: 'system', label: 'cart', depth: 0, source: 'system' },
    { url: new URL('/search?q=pla', seedUrl).toString(), type: 'system', label: 'search', depth: 0, source: 'system' },
    { url: new URL('/404-page-not-found-' + 'reference', seedUrl).toString(), type: 'system', label: '404', depth: 0, source: 'system' },
  ];
}

function normalize(href, originUrl) {
  try {
    const u = new URL(href, originUrl);
    if (u.origin !== originUrl.origin) return null;
    if (SKIP_EXTENSIONS.test(u.pathname)) return null;
    if (SKIP_PATH.test(u.pathname)) return null;
    u.hash = '';
    for (const k of SKIP_QUERY) u.searchParams.delete(k);
    // Drop any remaining query (collection sort/filter permutations explode the route set).
    u.search = '';
    return u.toString();
  } catch {
    return null;
  }
}

// Canonical dedup key: decoded, lower-cased, trailing-slash-stripped pathname. Lets us match a
// percent-encoded sitemap URL against a literal-Cyrillic href for the same page.
function canonKey(url) {
  try { return decodeURIComponent(new URL(url).pathname).replace(/\/$/, '').toLowerCase(); }
  catch { return String(url); }
}

// Shopify's default "all products" listing is a distinct, vital template that is frequently
// NOT linked from the nav and NOT in the sitemap. Guarantee it's present.
const KNOWN_LISTINGS = ['/collections/all'];

// Classify a Shopify route by pathname so we can cap product pages but keep everything else.
function classify(pathname) {
  if (pathname === '/' || pathname === '') return 'home';
  if (/\/products\//.test(pathname)) return 'product';
  if (/\/collections\//.test(pathname)) return 'collection';
  if (/\/blogs\//.test(pathname)) return 'blog';
  if (/\/pages\//.test(pathname)) return 'page';
  if (/\/policies\//.test(pathname)) return 'policy';
  return 'other';
}

// --- Sitemap discovery -----------------------------------------------------

async function fetchText(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; easytech3d-mirror/1.0)' },
      redirect: 'follow',
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function extractLocs(xml) {
  const locs = [];
  const re = /<loc>\s*([^<\s]+)\s*<\/loc>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) {
    locs.push(m[1].replace(/&amp;/g, '&').trim());
  }
  return locs;
}

// Returns { routes, subSitemaps, counts } or null if no usable sitemap.
async function discoverViaSitemap(seedUrl, { products, max }, log) {
  const indexUrl = new URL('/sitemap.xml', seedUrl).toString();
  log(`sitemap: fetching ${indexUrl}`);
  const indexXml = await fetchText(indexUrl);
  if (!indexXml) {
    log('sitemap: not reachable — falling back to BFS');
    return null;
  }

  const locs = extractLocs(indexXml);
  const isIndex = /<sitemapindex/i.test(indexXml);
  // Sub-sitemap URLs (when the root is a <sitemapindex>) vs. page URLs (flat <urlset>).
  const subSitemaps = isIndex ? locs.filter((l) => /\.xml(\?|$)/i.test(l)) : [indexUrl];

  const pageUrls = new Set();
  if (isIndex) {
    for (const sm of subSitemaps) {
      // Skip Shopify's agentic-discovery sitemap — it's not page content.
      if (/agentic_discovery/i.test(sm)) continue;
      log(`sitemap: reading ${sm.split('/').pop().split('?')[0]}`);
      const xml = await fetchText(sm);
      if (!xml) continue;
      for (const u of extractLocs(xml)) pageUrls.add(u);
    }
  } else {
    for (const u of locs) pageUrls.add(u);
  }

  // Normalize + categorize.
  const buckets = new Map(); // type → [route]
  for (const raw of pageUrls) {
    const n = normalize(raw, seedUrl);
    if (!n) continue;
    const u = new URL(n);
    const type = classify(u.pathname);
    if (!buckets.has(type)) buckets.set(type, []);
    buckets.get(type).push({ url: n, type, depth: 0, source: 'sitemap' });
  }

  // Per-type policy: keep all home/pages/collections/blogs/policies; SAMPLE products.
  const order = ['home', 'page', 'collection', 'blog', 'product', 'policy', 'other'];
  const routes = [];
  const counts = {};
  for (const type of order) {
    let list = buckets.get(type) || [];
    list.sort((a, b) => a.url.localeCompare(b.url));
    if (type === 'product' && list.length > products) {
      // Even sample across the (alpha-sorted) product list rather than first-N.
      const step = list.length / products;
      list = Array.from({ length: products }, (_, i) => list[Math.floor(i * step)]);
    }
    counts[type] = list.length;
    routes.push(...list);
  }

  // Always make sure a home route exists and is first.
  if (!routes.some((r) => r.type === 'home')) {
    routes.unshift({ url: new URL('/', seedUrl).toString(), type: 'home', depth: 0, source: 'sitemap' });
    counts.home = 1;
  }

  const capped = routes.slice(0, max);
  log(`sitemap: ${pageUrls.size} URLs → ${routes.length} kept (${Object.entries(counts).map(([k, v]) => `${k}:${v}`).join(', ')})${capped.length < routes.length ? ` → capped to ${capped.length}` : ''}`);
  return { routes: capped, subSitemaps, counts };
}

// --- BFS discovery (fallback) ----------------------------------------------

async function discoverViaBfs(seedUrl, args, log) {
  log(`bfs: seed ${args.url}, depth ${args.depth}, max ${args.max}${args.headed ? ' (headed)' : ''}`);
  const browser = await chromium.launch({ headless: !args.headed, slowMo: args.slowmo });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const visited = new Map(); // url → { url, title, depth, type }
  const queue = [{ url: args.url, depth: 0 }];

  while (queue.length && visited.size < args.max) {
    const { url, depth } = queue.shift();
    if (visited.has(url)) continue;

    process.stdout.write(`bfs: [${visited.size + 1}/${args.max}] (d=${depth}) ${url} ... `);
    try {
      await page.goto(url, { waitUntil: 'load', timeout: NAV_TIMEOUT });
    } catch {
      process.stdout.write('skip (load failed)\n');
      continue;
    }
    await page.waitForLoadState('networkidle', { timeout: 3_000 }).catch(() => {});
    await page.waitForTimeout(150);

    const title = (await page.title()).trim() || '(no title)';
    visited.set(url, { url, title, depth, type: classify(new URL(url).pathname), source: 'bfs' });
    process.stdout.write(`ok — ${title}\n`);

    if (depth < args.depth) {
      const hrefs = await page.evaluate(() => {
        const out = new Set();
        for (const a of document.querySelectorAll('a[href]')) {
          const h = a.getAttribute('href');
          if (h) out.add(h);
        }
        return [...out];
      });
      for (const h of hrefs) {
        const n = normalize(h, seedUrl);
        if (!n || visited.has(n) || queue.find((q) => q.url === n)) continue;
        queue.push({ url: n, depth: depth + 1 });
      }
    }
  }

  await browser.close();
  return { routes: [...visited.values()] };
}

async function run() {
  const args = parseArgs(process.argv);
  const seedUrl = new URL(args.url);
  const outDir = path.resolve(__dirname, '..', 'output', 'reference');
  fs.mkdirSync(outDir, { recursive: true });
  const log = (msg) => console.log(`crawl: ${msg}`);

  let result = null;
  let mode = 'bfs';
  if (args.sitemap && !args.bfs) {
    result = await discoverViaSitemap(seedUrl, args, log);
    if (result && result.routes.length) mode = 'sitemap';
  }
  if (!result || !result.routes.length) {
    result = await discoverViaBfs(seedUrl, args, log);
    mode = 'bfs';
  }

  const routes = result.routes;

  // Harvest hub-page links (home, /collections, blog index) and merge any non-product content
  // page the sitemap missed (e.g. /policies/*, noindex pages). Sitemap mode only — BFS already
  // follows links exhaustively.
  if (args.harvest && mode === 'sitemap') {
    const harvested = await harvestHubLinks(seedUrl, routes.map((r) => r.url), log);
    routes.push(...harvested);

    // Guarantee known-but-often-unlinked listings (e.g. /collections/all).
    const have = new Set(routes.map((r) => canonKey(r.url)));
    for (const p of KNOWN_LISTINGS) {
      const u = new URL(p, seedUrl).toString();
      if (!have.has(canonKey(u))) {
        routes.push({ url: u, type: 'collection', depth: 0, source: 'known' });
        have.add(canonKey(u));
        log(`known: added ${p}`);
      }
    }
  }

  // Append the system templates (cart/search/404) the sitemap doesn't list — deduped by url.
  if (args.system) {
    const seen = new Set(routes.map((r) => r.url));
    let added = 0;
    for (const sr of systemRoutes(seedUrl)) {
      if (seen.has(sr.url)) continue;
      routes.push(sr);
      seen.add(sr.url);
      added++;
    }
    if (added) log(`system: added ${added} template route(s) (cart, search, 404)`);
  }
  const out = {
    seed: args.url,
    crawledAt: new Date().toISOString(),
    mode,
    depth: args.depth,
    cap: args.max,
    productCap: args.products,
    count: routes.length,
    typeCounts: result.counts || undefined,
    routes,
  };
  const routesPath = path.join(outDir, 'routes.json');
  fs.writeFileSync(routesPath, JSON.stringify(out, null, 2));
  console.log(`crawl: done — ${routes.length} routes via ${mode}`);
  console.log(`  → ${routesPath}`);
  console.log('  → edit that file to prune anything irrelevant, then: pnpm ref:capture');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
