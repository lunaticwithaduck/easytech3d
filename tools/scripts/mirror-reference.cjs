/**
 * Mirror the reference site locally. Walks each route in routes.json, intercepts
 * every same-origin HTTP response, and saves the body to disk under its URL pathname.
 * After capture, rewrites absolute origin references in HTML/CSS/JS so the mirror
 * works when served from a local origin (e.g. http://localhost:4173).
 *
 * Cross-origin resources (CDN fonts, analytics, etc.) are intentionally left external —
 * they'll either load over the network when you view the mirror, or 404 cleanly offline.
 * NOTE for Shopify (easytech3d.com): the theme CSS/JS/images are served from
 * cdn.shopify.com (cross-origin), so the local mirror saves the rendered HTML and pulls
 * those assets from the CDN at view time — i.e. the mirror is fully styled when viewed
 * online, and a bare HTML skeleton offline. The capture step's screenshots + computed
 * digest are the offline-durable reference.
 *
 * Runs up to --concurrency routes in parallel (own site → fine to be aggressive).
 *
 * Usage:
 *   node scripts/mirror-reference.cjs
 *   node scripts/mirror-reference.cjs --routes=output/reference/routes.json
 *   node scripts/mirror-reference.cjs --concurrency=4
 *   node scripts/mirror-reference.cjs --headed
 *
 * Serve the mirror:
 *   pnpm ref:serve     (then open http://localhost:4173/_index.html)
 */

const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const DEFAULT_ROUTES = path.resolve(__dirname, '..', 'output', 'reference', 'routes.json');
const NAV_TIMEOUT = 30_000;
const VIEWPORT = { width: 1440, height: 900 };

function parseArgs(argv) {
  const out = { routes: DEFAULT_ROUTES, concurrency: 4, headed: false, slowmo: 0 };
  for (const a of argv.slice(2)) {
    if (a.startsWith('--routes=')) out.routes = path.resolve(a.slice(9));
    else if (a.startsWith('--concurrency=')) out.concurrency = Math.max(1, Number(a.slice(14)) || 1);
    else if (a === '--headed') out.headed = true;
    else if (a.startsWith('--slowmo=')) out.slowmo = Number(a.slice(9));
  }
  return out;
}

// Map a URL to a path inside mirrorDir. Directory-like URLs (ending in /, or with no
// file extension) become `<dir>/index.html`.
function urlToLocalPath(url, mirrorDir) {
  let p = url.pathname;
  const lastSeg = p.split('/').pop();
  const hasExtension = lastSeg && /\.[a-zA-Z0-9]{1,8}$/.test(lastSeg);
  if (p.endsWith('/')) p += 'index.html';
  else if (!hasExtension) p += '/index.html';
  // Cap each segment so deep Cyrillic (percent-encoded) paths don't blow Windows' MAX_PATH.
  // Over-long segments keep a readable prefix + a hash. The _index.html links still resolve
  // (writeIndex derives hrefs from this same function); only in-page links that hard-code the
  // original long href won't reach the truncated file — those pages' HTML is still saved, and
  // the capture step holds the durable per-route reference regardless.
  const safe = p
    .split('/')
    .map((s) => {
      s = s.replace(/[<>:"|?*]/g, '_');
      if (s.length > 80) {
        const ext = (s.match(/\.[a-zA-Z0-9]{1,8}$/) || [''])[0];
        const h = crypto.createHash('sha1').update(s).digest('hex').slice(0, 8);
        s = s.slice(0, 80) + '-' + h + ext;
      }
      return s;
    })
    .join('/');
  return path.join(mirrorDir, safe.replace(/^\//, ''));
}

async function exhaustiveScroll(page) {
  return page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const distance = 600;
    let stable = 0;
    let lastH = 0;
    for (let i = 0; i < 8 && stable < 2; i++) {
      const h = document.body.scrollHeight;
      for (let y = 0; y < h; y += distance) {
        window.scrollTo(0, y);
        await sleep(120);
      }
      window.scrollTo(0, h);
      await sleep(500);
      if (document.body.scrollHeight === lastH) stable++;
      else { stable = 0; lastH = document.body.scrollHeight; }
    }
    window.scrollTo(0, 0);
    await sleep(300);
  }).catch(() => {});
}

async function mirrorRoute(browser, route, mirrorDir, seedOrigin, savedUrls, stats, log) {
  const ctx = await browser.newContext({ viewport: VIEWPORT });
  const page = await ctx.newPage();

  ctx.on('response', async (response) => {
    try {
      const url = new URL(response.url());
      if (url.origin !== seedOrigin) return;
      const key = url.pathname; // dedup by pathname (ignore query strings)
      if (savedUrls.has(key)) return;
      savedUrls.add(key);

      const status = response.status();
      if (status >= 300) return; // skip redirects + errors

      const buffer = await response.body().catch(() => null);
      if (!buffer) return;

      const localPath = urlToLocalPath(url, mirrorDir);
      fs.mkdirSync(path.dirname(localPath), { recursive: true });
      fs.writeFileSync(localPath, buffer);
      stats.bytes += buffer.length;
      stats.files += 1;
    } catch {
      // per-resource failures are non-fatal
    }
  });

  try {
    await page.goto(route.url, { waitUntil: 'load', timeout: NAV_TIMEOUT });
  } catch {}
  await page.waitForLoadState('networkidle', { timeout: 4_000 }).catch(() => {});
  await exhaustiveScroll(page);

  // Replace the intercepted initial HTML with the post-JS rendered HTML — usually
  // identical for WP/Elementor, but covers any client-side mutations.
  const html = await page.content();
  const htmlPath = urlToLocalPath(new URL(route.url), mirrorDir);
  fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
  fs.writeFileSync(htmlPath, html);
  log(`html → ${path.relative(mirrorDir, htmlPath)}`);

  await ctx.close();
}

function walkFiles(dir, predicate, onFile) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, predicate, onFile);
    else if (predicate(entry.name)) onFile(full);
  }
}

function rewriteAbsoluteUrls(mirrorDir, seedOrigin) {
  const escaped = seedOrigin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped, 'g');
  let rewritten = 0;
  walkFiles(mirrorDir, (n) => /\.(html|css|js|svg|xml|json)$/i.test(n), (full) => {
    try {
      const original = fs.readFileSync(full, 'utf8');
      const next = original.replace(re, '');
      if (next !== original) {
        fs.writeFileSync(full, next);
        rewritten++;
      }
    } catch {}
  });
  return rewritten;
}

function writeIndex(mirrorDir, seedOrigin, routes, savedCount, totalBytes) {
  const sizeMB = (totalBytes / (1024 * 1024)).toFixed(1);
  const links = routes
    .map((r) => {
      const u = new URL(r.url);
      // Derive the href from the SAME on-disk path urlToLocalPath produced (hashing included)
      // so long-slug routes stay clickable in the index.
      const localPath = urlToLocalPath(u, mirrorDir);
      const href = '/' + path.relative(mirrorDir, localPath).split(path.sep).join('/');
      return `<li><a href="${href}">${r.title || r.url}</a> <small style="color:#888">${u.pathname}</small></li>`;
    })
    .join('\n  ');
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Reference mirror — ${seedOrigin}</title>
<style>
body { font: 14px/1.5 system-ui, sans-serif; max-width: 760px; margin: 40px auto; padding: 0 16px; color: #222; }
h1 { font-size: 20px; margin: 0 0 4px; }
.meta { color: #666; margin-bottom: 24px; font-size: 13px; }
ul { padding-left: 0; list-style: none; }
li { margin: 8px 0; padding: 8px 12px; background: #f4f4f4; border-radius: 6px; }
a { color: #0e1e3f; text-decoration: none; font-weight: 500; }
a:hover { text-decoration: underline; }
</style></head>
<body>
<h1>Reference mirror — ${seedOrigin}</h1>
<div class="meta">${routes.length} pages · ${savedCount} unique resources · ${sizeMB} MB · captured ${new Date().toISOString()}</div>
<ul>
  ${links}
</ul>
</body></html>`;
  fs.writeFileSync(path.join(mirrorDir, '_index.html'), html);
}

async function run() {
  const args = parseArgs(process.argv);
  if (!fs.existsSync(args.routes)) {
    console.error(`mirror: routes file not found: ${args.routes}`);
    process.exit(2);
  }
  const routesFile = JSON.parse(fs.readFileSync(args.routes, 'utf8'));
  const routes = routesFile.routes || [];
  if (!routes.length) {
    console.error('mirror: routes file is empty');
    process.exit(2);
  }
  const seedOrigin = new URL(routesFile.seed).origin;
  const mirrorDir = path.resolve(__dirname, '..', 'output', 'reference', 'mirror');
  fs.mkdirSync(mirrorDir, { recursive: true });

  const concurrency = (args.headed || args.slowmo) ? 1 : Math.max(1, args.concurrency);
  console.log(`mirror: ${routes.length} routes from ${seedOrigin} · concurrency ${concurrency}${args.headed ? ' (headed)' : ''}`);
  const browser = await chromium.launch({ headless: !args.headed, slowMo: args.slowmo });
  // savedUrls dedups resources across all routes. The has()→add() pair below is synchronous
  // (no await between), so concurrent response handlers can't double-save the same pathname.
  const savedUrls = new Set();
  const stats = { bytes: 0, files: 0 };

  // Index-keyed worker pool — up to `concurrency` routes mirrored at once, each in its own context.
  let next = 0;
  async function worker() {
    while (true) {
      const i = next++;
      if (i >= routes.length) return;
      const route = routes[i];
      const prefix = `mirror: [${i + 1}/${routes.length}]`;
      console.log(`${prefix} ${route.url}`);
      const log = (msg) => console.log(`${prefix}  ${msg}`);
      try {
        await mirrorRoute(browser, route, mirrorDir, seedOrigin, savedUrls, stats, log);
      } catch (err) {
        log(`fail (${err.message})`);
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  await browser.close();

  console.log(`mirror: rewriting ${seedOrigin} → (relative) in HTML/CSS/JS`);
  const rewritten = rewriteAbsoluteUrls(mirrorDir, seedOrigin);
  console.log(`mirror: rewrote ${rewritten} file(s)`);

  writeIndex(mirrorDir, seedOrigin, routes, stats.files, stats.bytes);

  console.log(`mirror: done — ${stats.files} files, ${(stats.bytes / (1024 * 1024)).toFixed(1)} MB`);
  console.log(`  → ${mirrorDir}`);
  console.log(`  serve with: pnpm ref:serve  (then http://localhost:4173/_index.html)`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
