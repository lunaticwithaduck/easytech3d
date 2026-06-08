/**
 * Step B of the site teardown. For each route in routes.json:
 *   - navigate, dismiss cookie banner, exhaust lazy-load via repeated scroll
 *   - desktop (1440×900) + mobile (390×844) full-page screenshots
 *   - on mobile: try to open the nav drawer and screenshot it
 *   - on desktop: try to open the first image gallery/lightbox and screenshot it
 *   - HTML dump
 *   - computed-style digest (typography, colors, spacing, layout sections, components)
 *
 * Then writes design-notes.md (per-page brief) + design-data.json (raw).
 *
 * Runs up to --concurrency routes in parallel (each in its own browser contexts), since
 * easytech3d.com is our own site and we can be a little aggressive. Selectors include
 * Shopify's cookie/consent + drawer-nav conventions on top of the generic ones.
 *
 * Usage:
 *   node scripts/capture-reference.cjs
 *   node scripts/capture-reference.cjs --routes=output/reference/routes.json
 *   node scripts/capture-reference.cjs --concurrency=4
 *   node scripts/capture-reference.cjs --headed --slowmo=100
 *   node scripts/capture-reference.cjs --skip-mobile
 */

const { chromium } = require('playwright');
const { PNG } = require('pngjs');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const DEFAULT_ROUTES = path.resolve(__dirname, '..', 'output', 'reference', 'routes.json');
const NAV_TIMEOUT = 30_000;
const NETWORK_IDLE_SOFT_TIMEOUT = 4_000;
const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

// --- Interaction targets ---------------------------------------------------
// "Accept" phrases across BG / EN (easytech3d.com is BG-primary with an EN switch).
// Order matters: "Accept all" / "Приемам всички" come BEFORE the shorter "Accept" / "OK"
// variants, so on banners with both we click the broader option.
const COOKIE_ACCEPT_PHRASES = [
  'Accept all', 'Accept All', 'Allow all', 'Allow All',
  'Приемам всички', 'Приеми всички', 'Приемане на всички',
  'Accept', 'Allow', 'Agree', 'I agree', 'I understand',
  'Приемам', 'Приеми', 'Съгласен съм', 'Съгласен', 'Разрешавам',
  'OK', 'Ok', 'Got it', 'Continue', 'Разбрах', 'Продължи',
];

const COOKIE_SELECTORS = [
  // Shopify's native privacy/consent banner
  '#shopify-pc__banner__btn-accept',
  '.shopify-pc__banner__btn-accept',
  'button[data-consent="accept"]',
  // Common third-party consent widgets used on Shopify themes
  '#onetrust-accept-btn-handler',
  '#CybotCookiebotDialogBodyLevelButtonAccept',
  '#CybotCookiebotDialogBodyButtonAccept',
  '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
  '.cc-accept-all',
  '.cc-allow',
  '.cookie-accept',
  '.cookie-banner button',
  '#cookieConsent button',
  '[id*="cookie" i] button[id*="accept" i]',
  '[class*="cookie" i] button[class*="accept" i]',
  '[class*="consent" i] button[class*="accept" i]',
];

const MOBILE_MENU_SELECTORS = [
  // Shopify themes (Dawn and its many derivatives) use a <summary>/<details> drawer.
  'summary.header__icon--menu',
  '.header__icon--menu',
  'details[id*="Details-menu" i] summary',
  '#menu-drawer summary',
  'button[aria-label*="menu" i]',
  '[aria-controls*="menu" i]',
  // Generic patterns
  '[role="button"][aria-label*="menu" i]',
  '[role="button"][aria-label*="меню" i]',
  'button[aria-label*="navigation" i]',
  'button[aria-label*="навигация" i]',
  'button[class*="hamburger" i]',
  'button[class*="burger" i]',
  '.menu-toggle',
  '.nav-toggle',
  '.menu-trigger',
  '.mobile-menu-toggle',
  'header button[class*="menu" i]',
];

const GALLERY_TRIGGER_SELECTORS = [
  // Shopify product/media galleries + common lightbox markers
  '.product__media a[href*="/cdn/"]',
  'a[data-media-id]',
  'modal-opener [role="button"]',
  '.product-media-modal__toggle',
  'a[data-fancybox]',
  'a[data-lightbox]',
  '[data-open-lightbox]',
  '[class*="gallery" i] a:has(img)',
  '[class*="lightbox" i] a:has(img)',
];

const LIGHTBOX_OPEN_INDICATORS = [
  // Shopify Dawn product-media modal
  '.product-media-modal[open]',
  'product-modal[open]',
  '.fancybox-container.fancybox-is-open',
  '.fancybox-active',
  '[class*="lightbox" i][class*="open" i]',
  '[class*="lightbox" i][class*="active" i]',
  '[role="dialog"][aria-modal="true"]',
];

// --- Helpers ---------------------------------------------------------------

async function navigateAndLoad(page, url) {
  try {
    await page.goto(url, { waitUntil: 'load', timeout: NAV_TIMEOUT });
  } catch {
    // Some sites throw on `load` due to long-lived assets — keep going.
  }
  await page.waitForLoadState('networkidle', { timeout: NETWORK_IDLE_SOFT_TIMEOUT }).catch(() => {});
}

async function tryClickFirstVisible(page, selectors, { timeout = 250 } = {}) {
  // Search main frame + any iframes (cookie banners commonly render in iframes)
  for (const frame of page.frames()) {
    for (const sel of selectors) {
      try {
        const el = frame.locator(sel).first();
        const visible = await el.isVisible({ timeout }).catch(() => false);
        if (visible) {
          await el.click({ timeout: 2_000 });
          return sel;
        }
      } catch {
        // selector might be unsupported in this frame — keep going
      }
    }
  }
  return null;
}

async function tryClickFirstByText(page, phrases, { timeout = 250 } = {}) {
  for (const frame of page.frames()) {
    for (const phrase of phrases) {
      try {
        // Match button or anchor with exact text; case-insensitive via :has-text
        const el = frame.locator(`button:has-text("${phrase}"), a:has-text("${phrase}"), [role="button"]:has-text("${phrase}")`).first();
        const visible = await el.isVisible({ timeout }).catch(() => false);
        if (visible) {
          await el.click({ timeout: 2_000 });
          return phrase;
        }
      } catch {}
    }
  }
  return null;
}

async function dismissCookies(page) {
  const hitText = await tryClickFirstByText(page, COOKIE_ACCEPT_PHRASES);
  if (hitText) return { dismissed: true, via: `text:${hitText}` };
  const hitSel = await tryClickFirstVisible(page, COOKIE_SELECTORS);
  if (hitSel) return { dismissed: true, via: `sel:${hitSel}` };
  return { dismissed: false };
}

// Scroll the page until scrollHeight stops growing (or we hit a safety cap).
// Returns how many growth iterations we observed — useful for debugging "did we get everything?"
async function exhaustiveScroll(page) {
  return page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const distance = 600;
    const stepDelay = 120;
    const settleDelay = 600;
    const maxPasses = 8;
    const stableTarget = 2;

    let stableCount = 0;
    let lastHeight = 0;
    let passes = 0;
    let growthEvents = 0;

    while (passes < maxPasses && stableCount < stableTarget) {
      const startHeight = document.body.scrollHeight;
      for (let y = 0; y < startHeight; y += distance) {
        window.scrollTo(0, y);
        await sleep(stepDelay);
      }
      window.scrollTo(0, startHeight);
      await sleep(settleDelay);

      const endHeight = document.body.scrollHeight;
      if (endHeight > lastHeight) {
        growthEvents++;
        stableCount = 0;
        lastHeight = endHeight;
      } else {
        stableCount++;
      }
      passes++;
    }

    window.scrollTo(0, 0);
    await sleep(400);
    return { passes, growthEvents, finalHeight: document.body.scrollHeight };
  }).catch(() => ({ passes: 0, growthEvents: 0, finalHeight: 0, error: true }));
}

async function openMobileMenu(page) {
  const hit = await tryClickFirstVisible(page, MOBILE_MENU_SELECTORS, { timeout: 400 });
  return hit ? { opened: true, via: hit } : { opened: false };
}

async function tryOpenGallery(page) {
  const startUrl = page.url();
  const triggered = await tryClickFirstVisible(page, GALLERY_TRIGGER_SELECTORS, { timeout: 400 });
  if (!triggered) return { opened: false };
  await page.waitForTimeout(900);

  // The click might have navigated to a new page instead of opening a lightbox — undo if so.
  if (page.url() !== startUrl) {
    await page.goBack({ waitUntil: 'load', timeout: 15_000 }).catch(() => {});
    await page.waitForLoadState('networkidle', { timeout: 3_000 }).catch(() => {});
    return { opened: false, navigated: true, via: triggered };
  }

  for (const indicator of LIGHTBOX_OPEN_INDICATORS) {
    const visible = await page.locator(indicator).first().isVisible({ timeout: 400 }).catch(() => false);
    if (visible) return { opened: true, via: triggered, indicator };
  }
  return { opened: false, via: triggered, indicatorMissing: true };
}

async function closeLightboxIfOpen(page) {
  // ESC tends to work on most lightboxes. Fall back to common close buttons.
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(200);
  await tryClickFirstVisible(page, [
    '.fancybox-button--close',
    '.elementor-lightbox-close-button',
    '[aria-label*="close" i]',
    '[class*="lightbox" i] [class*="close" i]',
  ], { timeout: 200 }).catch(() => null);
}

// Crop a full-page screenshot into per-section PNGs using the bounds we collected
// in the digest. Returns one entry per cropped file, keyed by section.seq so the
// caller can attach file paths back to the digest for rendering.
function cropSectionsFromPng(pngPath, sections, sectionsDir) {
  if (!sections || !sections.length) return [];
  const buffer = fs.readFileSync(pngPath);
  const png = PNG.sync.read(buffer);
  fs.mkdirSync(sectionsDir, { recursive: true });
  const results = [];
  for (const s of sections) {
    if (s.x < 0 || s.y < 0) continue;
    const w = Math.min(s.dimensions.width, png.width - s.x);
    const h = Math.min(s.dimensions.height, png.height - s.y);
    if (w <= 0 || h <= 0) continue;
    if (s.x + w > png.width || s.y + h > png.height) continue;

    const out = new PNG({ width: w, height: h });
    PNG.bitblt(png, out, s.x, s.y, w, h, 0, 0);
    const classSuffix = s.classes[0]
      ? '-' + s.classes[0].replace(/[^a-z0-9]+/gi, '').slice(0, 20).toLowerCase()
      : '';
    const filename = `${String(s.seq).padStart(2, '0')}-${s.tag}${classSuffix}.png`;
    const file = path.join(sectionsDir, filename);
    fs.writeFileSync(file, PNG.sync.write(out));
    results.push({ seq: s.seq, file: 'sections/' + filename });
  }
  return results;
}

// --- Main per-route capture ------------------------------------------------

function parseArgs(argv) {
  const out = { routes: DEFAULT_ROUTES, skipDesktop: false, skipMobile: false, concurrency: 4, headed: false, slowmo: 0 };
  for (const a of argv.slice(2)) {
    if (a.startsWith('--routes=')) out.routes = path.resolve(a.slice(9));
    else if (a === '--skip-desktop') out.skipDesktop = true;
    else if (a === '--skip-mobile') out.skipMobile = true;
    else if (a.startsWith('--concurrency=')) out.concurrency = Math.max(1, Number(a.slice(14)) || 1);
    else if (a === '--headed') out.headed = true;
    else if (a.startsWith('--slowmo=')) out.slowmo = Number(a.slice(9));
  }
  return out;
}

function slug(url) {
  try {
    const u = new URL(url);
    let p = (u.pathname + (u.search || '')).replace(/^\//, '').replace(/[^a-z0-9]+/gi, '-').replace(/-+$/g, '');
    if (!p) return 'root';
    // Cyrillic blog/collection handles percent-encode into very long slugs that blow Windows'
    // MAX_PATH (~260). Cap the readable part and append a hash of the full path for uniqueness.
    if (p.length > 64) {
      const h = crypto.createHash('sha1').update(u.pathname + (u.search || '')).digest('hex').slice(0, 8);
      p = p.slice(0, 64).replace(/-+$/g, '') + '-' + h;
    }
    return p;
  } catch {
    return 'page';
  }
}

async function captureRoute(browser, route, outDir, args, log) {
  const routeSlug = slug(route.url);
  const routeDir = path.join(outDir, 'pages', routeSlug);
  fs.mkdirSync(routeDir, { recursive: true });

  const captured = [];        // ["desktop", "desktop-gallery", "mobile", "mobile-menu-open"]
  const actions = [];         // structured record of what we tried + outcome
  let digest = null;

  if (!args.skipDesktop) {
    const ctx = await browser.newContext({ viewport: DESKTOP, deviceScaleFactor: 1 });
    const page = await ctx.newPage();

    log('  desktop: loading');
    await navigateAndLoad(page, route.url);

    log('  desktop: dismissing cookies');
    const cookieResult = await dismissCookies(page);
    actions.push({ viewport: 'desktop', type: 'cookie', ...cookieResult });
    if (cookieResult.dismissed) await page.waitForTimeout(500);

    log('  desktop: exhaustive scroll');
    const scrollResult = await exhaustiveScroll(page);
    actions.push({ viewport: 'desktop', type: 'scroll', ...scrollResult });

    log('  desktop: digest + screenshot');
    digest = await collectDigest(page);
    const html = await page.content();
    fs.writeFileSync(path.join(routeDir, 'page.html'), html);
    const desktopPngPath = path.join(routeDir, 'desktop.png');
    await page.screenshot({ path: desktopPngPath, fullPage: true });
    captured.push('desktop');

    log('  desktop: cropping per-section screenshots');
    const sectionFiles = cropSectionsFromPng(desktopPngPath, digest.layout.sections, path.join(routeDir, 'sections'));
    // Attach the cropped file paths back to the digest so renderNotes can show them.
    const byseq = new Map(sectionFiles.map((s) => [s.seq, s.file]));
    for (const s of digest.layout.sections) {
      const f = byseq.get(s.seq);
      if (f) s.file = f;
    }
    actions.push({ viewport: 'desktop', type: 'sections', cropped: sectionFiles.length });

    log('  desktop: trying gallery');
    const galleryResult = await tryOpenGallery(page);
    actions.push({ viewport: 'desktop', type: 'gallery', ...galleryResult });
    if (galleryResult.opened) {
      await page.screenshot({ path: path.join(routeDir, 'desktop-gallery.png'), fullPage: false });
      captured.push('desktop-gallery');
      await closeLightboxIfOpen(page);
    }

    await ctx.close();
  }

  if (!args.skipMobile) {
    const ctx = await browser.newContext({ viewport: MOBILE, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();

    log('  mobile: loading');
    await navigateAndLoad(page, route.url);

    log('  mobile: dismissing cookies');
    const cookieResult = await dismissCookies(page);
    actions.push({ viewport: 'mobile', type: 'cookie', ...cookieResult });
    if (cookieResult.dismissed) await page.waitForTimeout(500);

    log('  mobile: exhaustive scroll');
    const scrollResult = await exhaustiveScroll(page);
    actions.push({ viewport: 'mobile', type: 'scroll', ...scrollResult });

    log('  mobile: screenshot');
    await page.screenshot({ path: path.join(routeDir, 'mobile.png'), fullPage: true });
    captured.push('mobile');

    log('  mobile: opening nav menu');
    const menuResult = await openMobileMenu(page);
    actions.push({ viewport: 'mobile', type: 'menu', ...menuResult });
    if (menuResult.opened) {
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(routeDir, 'mobile-menu-open.png'), fullPage: false });
      captured.push('mobile-menu-open');
    }

    await ctx.close();
  }

  return { route, digest, slug: routeSlug, captured, actions };
}

async function collectDigest(page) {
  return page.evaluate(() => {
    const SKIP_COLOR = new Set(['rgba(0, 0, 0, 0)', 'transparent', 'currentcolor', '', 'none']);

    const typo = new Map();
    const colors = new Map();
    const paddings = new Map();
    const margins = new Map();
    const radii = new Map();

    const all = document.querySelectorAll('*');
    for (const el of all) {
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) continue;
      const text = (el.textContent || '').trim();

      const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
      if (ownText) {
        const key = JSON.stringify({
          family: cs.fontFamily.split(',')[0].trim().replace(/^["']|["']$/g, ''),
          size: cs.fontSize,
          weight: cs.fontWeight,
          lineHeight: cs.lineHeight,
        });
        typo.set(key, (typo.get(key) ?? 0) + 1);
      }

      const bumpColor = (color, prop, w) => {
        if (SKIP_COLOR.has(color)) return;
        const k = `${color}|${prop}`;
        const cur = colors.get(k) ?? { color, prop, weight: 0, count: 0 };
        cur.weight += w;
        cur.count += 1;
        colors.set(k, cur);
      };
      bumpColor(cs.color, 'color', Math.min(text.length, 500));
      bumpColor(cs.backgroundColor, 'background-color', Math.sqrt(rect.width * rect.height));
      bumpColor(cs.borderTopColor, 'border', 1);

      for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
        const p = cs.getPropertyValue('padding-' + side.toLowerCase());
        if (p && p !== '0px') paddings.set(p, (paddings.get(p) ?? 0) + 1);
        const m = cs.getPropertyValue('margin-' + side.toLowerCase());
        if (m && m !== '0px') margins.set(m, (margins.get(m) ?? 0) + 1);
      }
      const br = cs.borderRadius;
      if (br && br !== '0px') radii.set(br, (radii.get(br) ?? 0) + 1);
    }

    // Top-level layout sections. Skip <main> itself (just a wrapper) and any section-tag
    // nested inside another section-tag (e.g. <nav> inside <header>) so we don't produce
    // overlapping screenshots. Result: roughly one entry per visual band of the page.
    const SECTION_TAGS = new Set(['header', 'footer', 'section', 'article', 'aside', 'nav']);
    const sections = [];
    function tagCounts(root) {
      const counts = {};
      for (const el of root.children) {
        counts[el.tagName.toLowerCase()] = (counts[el.tagName.toLowerCase()] ?? 0) + 1;
      }
      return counts;
    }
    function isTopLevelSection(el) {
      let p = el.parentElement;
      while (p && p !== document.body) {
        if (SECTION_TAGS.has(p.tagName.toLowerCase())) return false;
        p = p.parentElement;
      }
      return true;
    }
    // Ensure scrollY === 0 so getBoundingClientRect aligns with the full-page screenshot's
    // coordinate system (image y=0 == document y=0 == rect.top at scrollY=0).
    window.scrollTo(0, 0);
    let seq = 0;
    const sectionCandidates = document.querySelectorAll('header, footer, section, article, aside, nav');
    for (const el of sectionCandidates) {
      if (!isTopLevelSection(el)) continue;
      const rect = el.getBoundingClientRect();
      if (rect.height < 50 || rect.width < 50) continue;
      seq++;
      sections.push({
        seq,
        tag: el.tagName.toLowerCase(),
        classes: (el.className && typeof el.className === 'string') ? el.className.trim().split(/\s+/).slice(0, 6) : [],
        id: el.id || null,
        x: Math.max(0, Math.round(rect.left + window.scrollX)),
        y: Math.max(0, Math.round(rect.top + window.scrollY)),
        dimensions: { width: Math.round(rect.width), height: Math.round(rect.height) },
        childTagCounts: tagCounts(el),
        headings: [...el.querySelectorAll('h1,h2,h3')].slice(0, 5).map((h) => ({
          level: Number(h.tagName.slice(1)),
          text: (h.textContent || '').trim().slice(0, 120),
        })),
      });
    }

    const componentCounts = {
      buttons: document.querySelectorAll('button, [role="button"]').length,
      links: document.querySelectorAll('a[href]').length,
      inputs: document.querySelectorAll('input, textarea, select').length,
      forms: document.querySelectorAll('form').length,
      images: document.querySelectorAll('img').length,
      iframes: document.querySelectorAll('iframe').length,
      videos: document.querySelectorAll('video').length,
    };

    const navEl = document.querySelector('nav') || document.querySelector('header nav') || document.querySelector('[role="navigation"]');
    const navItems = navEl
      ? [...navEl.querySelectorAll('a')].slice(0, 12).map((a) => ({
          text: (a.textContent || '').trim().slice(0, 60),
          href: a.getAttribute('href'),
        })).filter((x) => x.text)
      : [];

    const sortByValue = (m, limit) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
    const sortByWeight = (m, limit) => [...m.values()].sort((a, b) => b.weight - a.weight).slice(0, limit);

    return {
      url: location.href,
      title: document.title,
      lang: document.documentElement.lang || null,
      pageHeight: Math.round(document.body.scrollHeight),
      typography: sortByValue(typo, 20).map(([k, count]) => ({ ...JSON.parse(k), count })),
      colors: sortByWeight(colors, 30),
      spacing: {
        paddings: sortByValue(paddings, 12).map(([v, c]) => ({ value: v, count: c })),
        margins: sortByValue(margins, 12).map(([v, c]) => ({ value: v, count: c })),
        borderRadii: sortByValue(radii, 8).map(([v, c]) => ({ value: v, count: c })),
      },
      layout: { sections: sections.slice(0, 20) },
      components: componentCounts,
      nav: { items: navItems },
    };
  });
}

function renderNotes({ seed, pages }) {
  const lines = [];
  lines.push(`# Reference design teardown`);
  lines.push('');
  lines.push(`Seed: ${seed}`);
  lines.push(`Captured: ${new Date().toISOString()}`);
  lines.push(`Pages: ${pages.length}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const p of pages) {
    if (!p.digest) continue;
    const d = p.digest;
    lines.push(`## ${d.title || p.route.url}`);
    lines.push('');
    lines.push(`URL: ${d.url}`);
    if (d.lang) lines.push(`Lang: \`${d.lang}\``);
    lines.push(`Page height: ${d.pageHeight}px`);
    lines.push('');

    lines.push(`### Captured screenshots`);
    lines.push('');
    for (const state of p.captured || []) {
      lines.push(`**${state}**`);
      lines.push('');
      lines.push(`![${state}](pages/${p.slug}/${state}.png)`);
      lines.push('');
    }

    if (p.actions && p.actions.length) {
      lines.push(`### Interactions attempted`);
      lines.push('');
      for (const a of p.actions) {
        const status = a.dismissed === true || a.opened === true ? 'ok' : (a.navigated ? 'wrong target (navigated, reverted)' : 'no match');
        const detail = a.via ? ` via \`${a.via}\`` : '';
        const extra = a.type === 'scroll' ? ` (passes=${a.passes}, growth=${a.growthEvents}, final=${a.finalHeight}px)` : '';
        lines.push(`- [${a.viewport}] ${a.type}: ${status}${detail}${extra}`);
      }
      lines.push('');
    }

    lines.push(`### Typography`);
    lines.push('');
    lines.push('| family | size | weight | line-height | count |');
    lines.push('| --- | --- | --- | --- | --- |');
    for (const t of d.typography) {
      lines.push(`| ${t.family} | ${t.size} | ${t.weight} | ${t.lineHeight} | ${t.count} |`);
    }
    lines.push('');

    lines.push(`### Colors (top 15 by weighted usage)`);
    lines.push('');
    lines.push('| color | prop | weight | count |');
    lines.push('| --- | --- | --- | --- |');
    for (const c of d.colors.slice(0, 15)) {
      lines.push(`| \`${c.color}\` | ${c.prop} | ${c.weight.toFixed(1)} | ${c.count} |`);
    }
    lines.push('');

    lines.push(`### Spacing`);
    lines.push('');
    lines.push(`**Padding (top values):** ${d.spacing.paddings.map((s) => `\`${s.value}\` ×${s.count}`).join(', ') || '—'}`);
    lines.push('');
    lines.push(`**Margin (top values):** ${d.spacing.margins.map((s) => `\`${s.value}\` ×${s.count}`).join(', ') || '—'}`);
    lines.push('');
    lines.push(`**Border-radius:** ${d.spacing.borderRadii.map((s) => `\`${s.value}\` ×${s.count}`).join(', ') || '—'}`);
    lines.push('');

    lines.push(`### Layout sections (with per-section screenshots)`);
    lines.push('');
    for (const s of d.layout.sections) {
      const cls = s.classes.length ? `.${s.classes.join('.')}` : '';
      const domId = s.id ? `#${s.id}` : '';
      const firstHeading = (s.headings && s.headings[0]) ? ` — "${s.headings[0].text}"` : '';
      lines.push(`**${String(s.seq).padStart(2, '0')}. \`<${s.tag}>${domId}${cls}\`** (${s.dimensions.width}×${s.dimensions.height}px)${firstHeading}`);
      lines.push('');
      if (s.file) {
        lines.push(`![${s.tag} ${s.seq}](pages/${p.slug}/${s.file})`);
        lines.push('');
      }
      if (s.headings && s.headings.length > 1) {
        for (const h of s.headings.slice(1)) {
          lines.push(`- h${h.level}: ${h.text}`);
        }
        lines.push('');
      }
    }

    lines.push(`### Components`);
    lines.push('');
    for (const [name, count] of Object.entries(d.components)) {
      lines.push(`- ${name}: ${count}`);
    }
    lines.push('');

    if (d.nav.items.length) {
      lines.push(`### Nav`);
      lines.push('');
      for (const item of d.nav.items) {
        lines.push(`- [${item.text}](${item.href})`);
      }
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  }
  return lines.join('\n');
}

async function run() {
  const args = parseArgs(process.argv);
  if (!fs.existsSync(args.routes)) {
    console.error(`capture: routes file not found: ${args.routes}`);
    console.error('         run `pnpm ref:crawl` first');
    process.exit(2);
  }
  const routesFile = JSON.parse(fs.readFileSync(args.routes, 'utf8'));
  const routes = routesFile.routes || [];
  if (!routes.length) {
    console.error('capture: routes file is empty');
    process.exit(2);
  }

  const outDir = path.resolve(__dirname, '..', 'output', 'reference');
  fs.mkdirSync(outDir, { recursive: true });

  // Headed/slowmo runs are meant to be watched — force serial so the windows don't fight.
  const concurrency = (args.headed || args.slowmo) ? 1 : Math.max(1, args.concurrency);
  console.log(`capture: ${routes.length} routes from ${routesFile.seed} · concurrency ${concurrency}${args.headed ? ' (headed)' : ''}${args.slowmo ? ` slowMo=${args.slowmo}ms` : ''}`);
  const browser = await chromium.launch({ headless: !args.headed, slowMo: args.slowmo });

  // Index-keyed worker pool: up to `concurrency` routes captured in parallel, each in its
  // own browser contexts. Results are slotted back by index so design-notes order is stable.
  const results = new Array(routes.length).fill(null);
  let next = 0;
  async function worker() {
    while (true) {
      const i = next++;
      if (i >= routes.length) return;
      const route = routes[i];
      const prefix = `capture: [${i + 1}/${routes.length}]`;
      console.log(`${prefix} ${route.url}`);
      const log = (msg) => console.log(`${prefix}${msg}`);
      try {
        const result = await captureRoute(browser, route, outDir, args, log);
        results[i] = result;
        log(`  done — captured: ${result.captured.join(', ')}`);
      } catch (err) {
        log(`  fail (${err.message})`);
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  const pages = results.filter(Boolean);

  await browser.close();

  fs.writeFileSync(path.join(outDir, 'design-data.json'), JSON.stringify({ seed: routesFile.seed, pages }, null, 2));
  fs.writeFileSync(path.join(outDir, 'design-notes.md'), renderNotes({ seed: routesFile.seed, pages }));

  console.log('capture: done');
  console.log(`  → ${path.join(outDir, 'design-notes.md')}`);
  console.log(`  → ${path.join(outDir, 'design-data.json')}`);
  console.log(`  → ${path.join(outDir, 'pages', '<slug>', '*.png + page.html')}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
