/**
 * Hybrid palette extraction.
 *
 *   CSS pass: every element's computed color / background-color / border / fill / stroke,
 *             plus :root custom properties → frequency-weighted by element render area.
 *   Pixel pass: desktop full-page screenshot → sampled pixels → k-means in Lab.
 *   Merge:    snap each pixel cluster to the nearest CSS color (ΔE < 8). Score blends
 *             CSS weight + pixel coverage. Then enforce variety so we don't return
 *             8 nearly-identical greys.
 *
 * Usage:
 *   node scripts/extract-palette.cjs                  # defaults to www.easytech3d.com
 *   node scripts/extract-palette.cjs --url=https://...
 *   node scripts/extract-palette.cjs --k=12 --top=8
 */

const { chromium } = require('playwright');
const { PNG } = require('pngjs');
const fs = require('node:fs');
const path = require('node:path');

const { parseColor, toHex, rgbToLab, deltaE, classifyRole } = require('./lib/color.cjs');
const { kmeans } = require('./lib/kmeans.cjs');

const DEFAULT_URL = 'https://www.easytech3d.com/';
const VIEWPORT = { width: 1440, height: 900 };
const PIXEL_SAMPLES_TARGET = 30_000; // ~30k Lab points → k-means converges in <1s
const SNAP_DELTA_E = 8;              // perceptual "same color" threshold
const VARIETY_DELTA_E = 10;          // min ΔE between picks in the final palette

function parseArgs(argv) {
  const out = { url: DEFAULT_URL, k: 10, top: 8, headed: false, slowmo: 0 };
  for (const a of argv.slice(2)) {
    if (a.startsWith('--url=')) out.url = a.slice(6);
    else if (a.startsWith('--k=')) out.k = Number(a.slice(4));
    else if (a.startsWith('--top=')) out.top = Number(a.slice(6));
    else if (a === '--headed') out.headed = true;
    else if (a.startsWith('--slowmo=')) out.slowmo = Number(a.slice(9));
  }
  return out;
}

async function collectCssColors(page) {
  return page.evaluate(() => {
    const COLOR_PROPS = [
      'color',
      'background-color',
      'border-top-color',
      'border-right-color',
      'border-bottom-color',
      'border-left-color',
      'fill',
      'stroke',
      'outline-color',
    ];
    const SKIP = new Set([
      'rgba(0, 0, 0, 0)',
      'transparent',
      'currentcolor',
      '',
      'inherit',
      'initial',
      'unset',
      'none',
    ]);

    // Per-color: weighted count by approx render area for background-like props,
    // and char-count for text color. Keeps "the giant white hero background"
    // from being beaten by "12 button border colors".
    const usage = new Map();
    const bump = (color, prop, weight) => {
      const key = `${color}|${prop}`;
      const cur = usage.get(key) ?? { color, prop, weight: 0, count: 0 };
      cur.weight += weight;
      cur.count += 1;
      usage.set(key, cur);
    };

    const all = document.querySelectorAll('*');
    for (const el of all) {
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const area = Math.max(0, rect.width) * Math.max(0, rect.height);
      const textLen = (el.textContent || '').trim().length;

      for (const prop of COLOR_PROPS) {
        const v = cs.getPropertyValue(prop).trim().toLowerCase();
        if (SKIP.has(v)) continue;
        if (/,\s*0\s*\)\s*$/.test(v)) continue; // skip rgba(R,G,B,0) / hsla(...,0) — fully transparent variants

        let weight;
        if (prop === 'color') weight = Math.min(textLen, 500);          // text size proxy
        else if (prop === 'background-color') weight = Math.sqrt(area); // bg area proxy
        else weight = 1;                                                 // borders/strokes
        if (weight <= 0) continue;

        bump(v, prop, weight);
      }
    }

    // :root custom properties that resolve to a color value
    const rootStyle = getComputedStyle(document.documentElement);
    const customProperties = [];
    for (let i = 0; i < rootStyle.length; i++) {
      const name = rootStyle[i];
      if (!name.startsWith('--')) continue;
      const value = rootStyle.getPropertyValue(name).trim();
      if (!value) continue;
      // Probe whether the value is actually a color.
      const probe = document.createElement('div');
      probe.style.color = value;
      document.documentElement.appendChild(probe);
      const computed = getComputedStyle(probe).color;
      probe.remove();
      if (computed && computed !== 'rgba(0, 0, 0, 0)' && computed !== 'rgb(0, 0, 0)') {
        // Only keep if the computed form actually changed (non-default)
        customProperties.push({ name, declaredValue: value, computed });
      } else if (computed && /^rgb/.test(computed) && computed !== 'rgb(0, 0, 0)') {
        customProperties.push({ name, declaredValue: value, computed });
      }
    }

    // Group usage entries by color (across props) for final ranking.
    const byColor = new Map();
    for (const entry of usage.values()) {
      const cur = byColor.get(entry.color) ?? { color: entry.color, totalWeight: 0, totalCount: 0, props: {} };
      cur.totalWeight += entry.weight;
      cur.totalCount += entry.count;
      cur.props[entry.prop] = (cur.props[entry.prop] ?? 0) + entry.count;
      byColor.set(entry.color, cur);
    }

    return {
      colors: [...byColor.values()].sort((a, b) => b.totalWeight - a.totalWeight),
      customProperties,
      sampledElements: all.length,
    };
  });
}

function samplePixels(buffer, target) {
  const png = PNG.sync.read(buffer);
  const { data, width, height } = png;
  const totalPx = width * height;
  const stride = Math.max(1, Math.floor(totalPx / target));
  const samples = [];
  for (let p = 0; p < totalPx; p += stride) {
    const i = p * 4;
    const a = data[i + 3];
    if (a < 200) continue; // skip transparent — rare on screenshots but safe
    const r = data[i], g = data[i + 1], b = data[i + 2];
    samples.push({ r, g, b });
  }
  return { samples, width, height, totalPx };
}

function mergePalette(cssEntries, pixelClusters, { top }) {
  // Normalize CSS weights so they're comparable to pixel shares.
  const cssMaxWeight = cssEntries.reduce((m, e) => Math.max(m, e.totalWeight), 0) || 1;

  // Parse CSS colors once. Drop fully transparent variants — they can't visually contribute,
  // and they'd otherwise hijack pixel clusters via the Lab snap (which ignores alpha).
  const cssParsed = cssEntries
    .map((e) => {
      const c = parseColor(e.color);
      if (!c || c.a === 0) return null;
      const opaque = { r: c.r, g: c.g, b: c.b, a: 1 };
      const lab = rgbToLab(c);
      return {
        hex: toHex(opaque),
        rgb: opaque,
        lab,
        alpha: c.a,
        cssWeight: e.totalWeight / cssMaxWeight,
        cssCount: e.totalCount,
        props: e.props,
        pixelShare: 0,
        provenance: new Set(['css']),
      };
    })
    .filter(Boolean);

  // Snap each pixel cluster to nearest CSS color; otherwise add as new candidate.
  for (const cluster of pixelClusters) {
    const labCluster = { L: cluster.centroid[0], a: cluster.centroid[1], b: cluster.centroid[2] };
    // Convert Lab centroid back to approximate sRGB by finding nearest sampled point — but
    // we don't have the inverse here cheaply. Track centroid hex via the cluster's stored rgb.
    let nearest = null;
    let nearestD = Infinity;
    for (const c of cssParsed) {
      const d = deltaE(labCluster, c.lab);
      if (d < nearestD) { nearestD = d; nearest = c; }
    }
    if (nearest && nearestD < SNAP_DELTA_E) {
      nearest.pixelShare += cluster.share;
      nearest.provenance.add('pixel');
    } else {
      cssParsed.push({
        hex: cluster.hex,
        rgb: cluster.rgb,
        lab: labCluster,
        cssWeight: 0,
        cssCount: 0,
        props: {},
        pixelShare: cluster.share,
        provenance: new Set(['pixel']),
      });
    }
  }

  // Score: blend CSS weight and pixel share. Pixel share is in [0,1]. CSS weight is
  // normalized to [0,1]. Give them ~equal voice.
  for (const c of cssParsed) {
    c.score = 0.5 * c.cssWeight + 0.5 * c.pixelShare;
  }

  // Sort by score, then enforce variety (no two picks within VARIETY_DELTA_E of each other).
  cssParsed.sort((a, b) => b.score - a.score);
  const picked = [];
  for (const c of cssParsed) {
    if (picked.length >= top) break;
    const tooClose = picked.some((p) => deltaE(p.lab, c.lab) < VARIETY_DELTA_E);
    if (!tooClose) picked.push(c);
  }

  return picked.map((c) => ({
    hex: c.hex,
    rgb: c.rgb,
    role: classifyRole(c.rgb),
    provenance: [...c.provenance].sort().join('+'),
    score: Number(c.score.toFixed(4)),
    pixelShare: Number(c.pixelShare.toFixed(4)),
    cssWeight: Number(c.cssWeight.toFixed(4)),
    cssCount: c.cssCount,
    alpha: c.alpha ?? 1,
    appearsAs: Object.keys(c.props),
  }));
}

function paletteHtml({ url, palette, screenshotName }) {
  const swatches = palette
    .map((c, i) => `
      <div class="swatch">
        <div class="chip" style="background:${c.hex}"></div>
        <div class="meta">
          <div class="hex">${c.hex}</div>
          <div class="role">${c.role}</div>
          <div class="prov">${c.provenance}</div>
          <div class="score">score ${c.score} · pixel ${c.pixelShare} · css ${c.cssWeight}</div>
          <div class="props">${c.appearsAs.join(', ') || '—'}</div>
        </div>
        <div class="idx">${i + 1}</div>
      </div>
    `)
    .join('');
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>easytech3d palette</title>
<style>
  body { font: 14px/1.4 system-ui, sans-serif; padding: 24px; background: #f7f7f7; color: #222; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  .url { color: #666; margin-bottom: 24px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
  .swatch { background: #fff; border: 1px solid #e2e2e2; border-radius: 8px; overflow: hidden; position: relative; }
  .chip { height: 120px; }
  .meta { padding: 12px; font-size: 12px; }
  .hex { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 14px; }
  .role { color: #555; margin-top: 2px; }
  .prov { color: #888; margin-top: 2px; }
  .score { color: #888; margin-top: 4px; font-family: ui-monospace, monospace; }
  .props { color: #888; margin-top: 4px; }
  .idx { position: absolute; top: 8px; right: 12px; font-size: 12px; color: rgba(255,255,255,0.85); text-shadow: 0 1px 2px rgba(0,0,0,0.4); font-weight: 600; }
  img.shot { max-width: 100%; border: 1px solid #e2e2e2; border-radius: 8px; margin-top: 24px; }
</style></head>
<body>
  <h1>Palette · ${palette.length} colors</h1>
  <div class="url">${url}</div>
  <div class="grid">${swatches}</div>
  <h2 style="margin-top:32px;font-size:14px;color:#666;">source screenshot</h2>
  <img class="shot" src="${screenshotName}" />
</body></html>`;
}

async function run() {
  const args = parseArgs(process.argv);
  const outDir = path.resolve(__dirname, '..', 'output', 'palette');
  fs.mkdirSync(outDir, { recursive: true });
  const screenshotName = 'easytech3d-home.png';
  const screenshotPath = path.join(outDir, screenshotName);

  console.log(`palette: launching chromium${args.headed ? ' (headed)' : ''}${args.slowmo ? ` slowMo=${args.slowmo}ms` : ''} → ${args.url}`);
  const browser = await chromium.launch({ headless: !args.headed, slowMo: args.slowmo });
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });
  const page = await context.newPage();
  try {
    await page.goto(args.url, { waitUntil: 'load', timeout: 30_000 });
  } catch {
    // continue anyway — most failures here are long-lived assets we don't need
  }
  await page.waitForLoadState('networkidle', { timeout: 4_000 }).catch(() => {});
  // Scroll to trigger lazy-loaded images so the screenshot captures the full visual
  try {
    await page.evaluate(async () => {
      const distance = 500;
      for (let y = 0; y < document.body.scrollHeight; y += distance) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 80));
      }
      window.scrollTo(0, 0);
    });
  } catch {}
  await page.waitForTimeout(500);

  console.log('palette: harvesting computed CSS colors');
  const cssData = await collectCssColors(page);
  console.log(`palette:   sampled ${cssData.sampledElements} elements, ${cssData.colors.length} unique colors, ${cssData.customProperties.length} custom properties`);

  console.log('palette: capturing full-page screenshot');
  const buffer = await page.screenshot({ fullPage: true, type: 'png' });
  fs.writeFileSync(screenshotPath, buffer);

  await browser.close();

  console.log('palette: sampling pixels');
  const { samples, width, height, totalPx } = samplePixels(buffer, PIXEL_SAMPLES_TARGET);
  console.log(`palette:   image ${width}×${height} (${totalPx} px), kept ${samples.length} samples`);

  console.log(`palette: running k-means (k=${args.k})`);
  const labPoints = samples.map((s) => {
    const lab = rgbToLab(s);
    return [lab.L, lab.a, lab.b];
  });
  const clusters = kmeans(labPoints, args.k);

  // For each cluster, find the sample whose Lab is closest to the centroid — use its RGB as the representative.
  const pixelClusters = clusters.map((c) => {
    let bestIdx = 0, bestD = Infinity;
    for (let i = 0; i < labPoints.length; i++) {
      const d = Math.hypot(labPoints[i][0] - c.centroid[0], labPoints[i][1] - c.centroid[1], labPoints[i][2] - c.centroid[2]);
      if (d < bestD) { bestD = d; bestIdx = i; }
    }
    const rgb = samples[bestIdx];
    return { centroid: c.centroid, share: c.share, size: c.size, rgb, hex: toHex(rgb) };
  });

  console.log('palette: merging CSS + pixel results');
  const palette = mergePalette(cssData.colors, pixelClusters, { top: args.top });

  const summary = {
    source: args.url,
    extractedAt: new Date().toISOString(),
    viewport: VIEWPORT,
    k: args.k,
    pickedCount: palette.length,
    palette,
  };
  fs.writeFileSync(path.join(outDir, 'palette.json'), JSON.stringify(summary, null, 2));
  fs.writeFileSync(
    path.join(outDir, 'palette-raw.json'),
    JSON.stringify({
      cssTop: cssData.colors.slice(0, 30),
      customProperties: cssData.customProperties,
      pixelClusters: pixelClusters.map((c) => ({ hex: c.hex, share: Number(c.share.toFixed(4)), size: c.size })),
    }, null, 2),
  );
  fs.writeFileSync(path.join(outDir, 'palette.html'), paletteHtml({ url: args.url, palette, screenshotName }));

  console.log('palette: done');
  console.log(`  → ${path.join(outDir, 'palette.json')}`);
  console.log(`  → ${path.join(outDir, 'palette.html')}  (open in a browser)`);
  console.log(`  → ${screenshotPath}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
