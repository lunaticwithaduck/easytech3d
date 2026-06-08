/**
 * Derive design tokens from the captured references — a starting design system for the rebuild.
 *
 *   Colors:     palette.json picks + the home-page computed colors (design-data.json), bucketed
 *               by HSL into semantic roles (text / surfaces / border / accents / danger).
 *   Typography: dominant font family + the size ladder & weights aggregated across all pages.
 *   Spacing:    most-common padding/margin values aggregated across all pages → a numeric scale.
 *   Radius:     most-common border-radius values.
 *
 * Emits, under output/design-tokens/:
 *   tokens.json          — framework-agnostic token set
 *   tokens.css           — :root CSS custom properties
 *   tailwind.tokens.cjs  — theme.extend snippet for Tailwind
 *
 *   node scripts/extract-tokens.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const { parseColor, toHex, rgbToHsl } = require('./lib/color.cjs');

const OUT = path.resolve(__dirname, '..', 'output', 'design-tokens');
const PALETTE = path.resolve(__dirname, '..', 'output', 'palette', 'palette.json');
const DESIGN = path.resolve(__dirname, '..', 'output', 'reference', 'design-data.json');

function load(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

// Build a de-duplicated list of color candidates {hex, rgb, hsl, weight, prop}.
function colorCandidates(palette, home) {
  const byHex = new Map();
  const add = (hex, rgb, weight, prop) => {
    const cur = byHex.get(hex) || { hex, rgb, hsl: rgbToHsl(rgb), weight: 0, props: new Set() };
    cur.weight += weight;
    cur.props.add(prop);
    byHex.set(hex, cur);
  };
  // Palette picks (already variety-enforced); weight by score.
  for (const c of palette.palette || []) {
    const rgb = parseColor(c.hex);
    if (rgb) add(toHex({ ...rgb, a: 1 }), rgb, (c.score || 0) * 1000 + 1, c.appearsAs ? c.appearsAs.join('+') : 'palette');
  }
  // Home computed colors (weighted by real usage).
  for (const c of (home && home.colors) || []) {
    const rgb = parseColor(c.color);
    if (!rgb || rgb.a === 0) continue;
    add(toHex({ r: rgb.r, g: rgb.g, b: rgb.b, a: 1 }), rgb, c.weight || 1, c.prop);
  }
  return [...byHex.values()];
}

function pickColors(cands) {
  const lum = (c) => c.hsl.l;
  const sat = (c) => c.hsl.s;
  const isChromatic = (c) => sat(c) >= 0.25 && lum(c) > 0.18 && lum(c) < 0.85;
  const usedAsText = (c) => c.props.has('color');
  const usedAsBg = (c) => [...c.props].some((p) => /background|palette|bg/.test(p));

  const darks = cands.filter((c) => lum(c) < 0.22 && sat(c) < 0.2).sort((a, b) => b.weight - a.weight);
  const lights = cands.filter((c) => lum(c) > 0.9 && sat(c) < 0.1).sort((a, b) => b.weight - a.weight);
  const greys = cands.filter((c) => sat(c) < 0.12 && lum(c) >= 0.22 && lum(c) <= 0.9).sort((a, b) => a.hsl.l - b.hsl.l);
  const chroma = cands.filter(isChromatic).sort((a, b) => b.weight - a.weight);

  const white = lights.find((c) => c.hex === '#ffffff') || lights[0];
  const surfaces = lights.filter((c) => c.hex !== (white && white.hex));

  // Accents: most-weighted chromatic = primary; pick a second distinct hue; a red as danger.
  const accent = chroma[0];
  const accent2 = chroma.find((c) => accent && Math.abs(c.hsl.h - accent.hsl.h) > 25);
  const danger = chroma.find((c) => c.hsl.h <= 12 || c.hsl.h >= 348);

  const text = darks[0] || cands.filter(usedAsText).sort((a, b) => b.weight - a.weight)[0];
  // text-muted: a mid grey; border: the lightest grey.
  const textMuted = greys.find((c) => c.hsl.l >= 0.35 && c.hsl.l <= 0.62) || greys[Math.floor(greys.length / 2)];
  const border = greys[greys.length - 1] || greys[0];

  // Contrast helper for on-accent.
  const onColor = (c) => (c && c.hsl.l < 0.6 ? '#ffffff' : (text ? text.hex : '#232323'));

  const out = {};
  if (text) out.text = text.hex;
  if (textMuted && textMuted !== text) out['text-muted'] = textMuted.hex;
  out.bg = (white && white.hex) || '#ffffff';
  if (surfaces[0]) out.surface = surfaces[0].hex;
  if (surfaces[1]) out['surface-2'] = surfaces[1].hex;
  if (border) out.border = border.hex;
  if (accent) { out.accent = accent.hex; out['on-accent'] = onColor(accent); }
  if (accent2 && accent2.hex !== (accent && accent.hex)) out['accent-2'] = accent2.hex;
  if (danger && danger.hex !== (accent && accent.hex)) out.danger = danger.hex;
  return out;
}

// Aggregate typography across all pages → family, size ladder, weights.
function pickTypography(pages) {
  const fam = new Map();
  const sizes = new Map();
  const weights = new Set();
  for (const p of pages) {
    for (const t of (p.digest && p.digest.typography) || []) {
      if (t.family) fam.set(t.family, (fam.get(t.family) || 0) + t.count);
      const px = parseFloat(t.size);
      if (Number.isFinite(px)) sizes.set(px, (sizes.get(px) || 0) + t.count);
      const w = parseInt(t.weight, 10);
      if (Number.isFinite(w)) weights.add(w);
    }
  }
  const family = [...fam.entries()].sort((a, b) => b[1] - a[1])[0];
  const ladder = [...sizes.entries()].filter(([px]) => px >= 11 && px <= 80).sort((a, b) => a[0] - b[0]).map(([px]) => px);
  // Anchor naming at the body base (size closest to 16px): smaller → sm/xs/2xs, larger → lg/xl/2xl…
  const baseIdx = ladder.reduce((best, px, i) => (Math.abs(px - 16) < Math.abs(ladder[best] - 16) ? i : best), 0);
  const down = ['sm', 'xs', '2xs', '3xs'];
  const up = ['lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'];
  const size = {};
  ladder.forEach((px, i) => {
    const d = i - baseIdx;
    const name = d === 0 ? 'base' : d < 0 ? down[-d - 1] : up[d - 1];
    if (name) size[name] = `${px}px`;
  });
  const weightNames = { 300: 'light', 400: 'regular', 500: 'medium', 600: 'semibold', 700: 'bold', 800: 'extrabold', 900: 'black' };
  const weight = {};
  [...weights].sort((a, b) => a - b).forEach((w) => { weight[weightNames[w] || `w${w}`] = w; });
  const primary = family ? family[0] : 'Instrument Sans';
  return {
    family: { sans: `'${primary}', ui-sans-serif, system-ui, -apple-system, sans-serif` },
    size,
    weight,
    _primary: primary,
  };
}

// Aggregate a numeric px scale from the most common paddings/margins.
function pickScale(pages, key) {
  const counts = new Map();
  for (const p of pages) {
    const arr = (p.digest && p.digest.spacing && p.digest.spacing[key]) || [];
    for (const s of arr) {
      const px = parseFloat(s.value);
      if (Number.isFinite(px) && px > 0 && px <= 200 && Number.isInteger(px)) counts.set(px, (counts.get(px) || 0) + s.count);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([px]) => px).sort((a, b) => a - b);
}

function pickRadii(pages) {
  const counts = new Map();
  for (const p of pages) {
    for (const s of (p.digest && p.digest.spacing && p.digest.spacing.borderRadii) || []) {
      const v = (s.value || '').trim();
      // Keep only clean single-value radii (e.g. "3px", "10px", "50%"); skip 0 and compounds.
      if (!/^\d+(\.\d+)?(px|%)$/.test(v) || v === '0px' || v === '0%') continue;
      counts.set(v, (counts.get(v) || 0) + s.count);
    }
  }
  // Rank by usage, keep the top few, then order by actual size for naming (% treated as "full").
  const sizeOf = (v) => (v.endsWith('%') ? 100000 : parseFloat(v));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([v]) => v)
    .sort((a, b) => sizeOf(a) - sizeOf(b));
}

function buildSpace(scale) {
  const out = {};
  scale.forEach((px) => { out[String(px)] = `${px}px`; });
  return out;
}
function buildRadius(radii) {
  const out = {};
  // Names by ascending size; a percentage radius (pill/circle) becomes `full`.
  const pct = radii.filter((v) => v.endsWith('%'));
  const px = radii.filter((v) => !v.endsWith('%'));
  const names = ['sm', 'md', 'lg', 'xl'];
  px.forEach((v, i) => { out[names[i] || `r${i}`] = v; });
  if (pct.length) out.full = pct[pct.length - 1];
  return out;
}

function toCss(tokens) {
  const lines = [':root {'];
  lines.push('  /* color */');
  for (const [k, v] of Object.entries(tokens.color)) lines.push(`  --color-${k}: ${v};`);
  lines.push('  /* typography */');
  lines.push(`  --font-sans: ${tokens.font.family.sans};`);
  for (const [k, v] of Object.entries(tokens.font.size)) lines.push(`  --text-${k}: ${v};`);
  for (const [k, v] of Object.entries(tokens.font.weight)) lines.push(`  --font-${k}: ${v};`);
  lines.push('  /* spacing */');
  for (const [k, v] of Object.entries(tokens.space)) lines.push(`  --space-${k}: ${v};`);
  lines.push('  /* radius */');
  for (const [k, v] of Object.entries(tokens.radius)) lines.push(`  --radius-${k}: ${v};`);
  lines.push('}');
  return lines.join('\n') + '\n';
}

function toTailwind(tokens) {
  const theme = {
    colors: tokens.color,
    fontFamily: { sans: tokens.font.family.sans.split(',').map((s) => s.trim().replace(/^'|'$/g, '')) },
    fontSize: tokens.font.size,
    fontWeight: tokens.font.weight,
    spacing: tokens.space,
    borderRadius: tokens.radius,
  };
  return '// Generated from the easytech3d.com reference — drop into tailwind.config theme.extend.\n'
    + 'module.exports = ' + JSON.stringify({ theme: { extend: theme } }, null, 2) + ';\n';
}

function run() {
  if (!fs.existsSync(PALETTE) || !fs.existsSync(DESIGN)) {
    console.error('tokens: missing inputs — run `pnpm palette` and `pnpm scan` first');
    console.error(`  expected: ${PALETTE}`);
    console.error(`            ${DESIGN}`);
    process.exit(2);
  }
  const palette = load(PALETTE);
  const design = load(DESIGN);
  const pages = (design.pages || []).filter((p) => p.digest);
  const home = (pages.find((p) => /\/$|easytech3d\.com$/.test((p.digest.url || '').replace(/\/$/, '') + '/')) || pages[0]).digest;

  const color = pickColors(colorCandidates(palette, home));
  const font = pickTypography(pages);
  const primary = font._primary;
  delete font._primary;
  const space = buildSpace(pickScale(pages, 'paddings'));
  const radius = buildRadius(pickRadii(pages));

  const tokens = {
    $source: palette.source || 'https://www.easytech3d.com/',
    $generatedFrom: ['palette.json', 'design-data.json'],
    $note: 'Auto-derived starting tokens. Review before shipping — color role mapping is heuristic.',
    color,
    font,
    space,
    radius,
  };

  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'tokens.json'), JSON.stringify(tokens, null, 2));
  fs.writeFileSync(path.join(OUT, 'tokens.css'), toCss(tokens));
  fs.writeFileSync(path.join(OUT, 'tailwind.tokens.cjs'), toTailwind(tokens));

  console.log('tokens: done');
  console.log(`  font: ${primary} · sizes ${Object.values(font.size).join('/')} · weights ${Object.values(font.weight).join('/')}`);
  console.log('  colors:', Object.entries(color).map(([k, v]) => `${k}=${v}`).join('  '));
  console.log(`  space: ${Object.values(space).join(' ')}  radius: ${Object.values(radius).join(' ')}`);
  console.log(`  → ${path.join(OUT, 'tokens.json')}`);
  console.log(`  → ${path.join(OUT, 'tokens.css')}`);
  console.log(`  → ${path.join(OUT, 'tailwind.tokens.cjs')}`);
}

run();
