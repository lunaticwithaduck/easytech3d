/**
 * Color utilities: parsing, hex formatting, sRGB↔Lab, ΔE.
 * Pure functions, no deps.
 */

function parseColor(value) {
  if (!value) return null;
  const v = String(value).trim().toLowerCase();
  if (!v || v === 'transparent' || v === 'currentcolor' || v === 'inherit' || v === 'initial' || v === 'unset' || v === 'none') return null;

  // #rgb, #rrggbb, #rrggbbaa
  const hex = v.match(/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/);
  if (hex) {
    const h = hex[1];
    if (h.length === 3) return { r: pH(h[0] + h[0]), g: pH(h[1] + h[1]), b: pH(h[2] + h[2]), a: 1 };
    if (h.length === 4) return { r: pH(h[0] + h[0]), g: pH(h[1] + h[1]), b: pH(h[2] + h[2]), a: pH(h[3] + h[3]) / 255 };
    if (h.length === 6) return { r: pH(h.slice(0, 2)), g: pH(h.slice(2, 4)), b: pH(h.slice(4, 6)), a: 1 };
    if (h.length === 8) return { r: pH(h.slice(0, 2)), g: pH(h.slice(2, 4)), b: pH(h.slice(4, 6)), a: pH(h.slice(6, 8)) / 255 };
  }

  // rgb(r,g,b) / rgba(r,g,b,a) / rgb(r g b / a) — handle both syntaxes
  const rgb = v.match(/^rgba?\(\s*([^)]+)\)$/);
  if (rgb) {
    const parts = rgb[1].split(/[\s,/]+/).filter(Boolean);
    if (parts.length >= 3) {
      const r = parseChannel(parts[0]);
      const g = parseChannel(parts[1]);
      const b = parseChannel(parts[2]);
      const a = parts[3] !== undefined ? parseAlpha(parts[3]) : 1;
      if (r != null && g != null && b != null) return { r, g, b, a };
    }
  }

  // hsl(h,s,l) / hsla / hsl(h s l / a)
  const hsl = v.match(/^hsla?\(\s*([^)]+)\)$/);
  if (hsl) {
    const parts = hsl[1].split(/[\s,/]+/).filter(Boolean);
    if (parts.length >= 3) {
      const h = parseFloat(parts[0]);
      const s = parseFloat(parts[1]) / 100;
      const l = parseFloat(parts[2]) / 100;
      const a = parts[3] !== undefined ? parseAlpha(parts[3]) : 1;
      if (Number.isFinite(h) && Number.isFinite(s) && Number.isFinite(l)) {
        const { r, g, b } = hslToRgb(h, s, l);
        return { r, g, b, a };
      }
    }
  }

  return null;
}

function pH(s) { return parseInt(s, 16); }

function parseChannel(s) {
  if (s.endsWith('%')) {
    const n = parseFloat(s);
    if (!Number.isFinite(n)) return null;
    return Math.round((n / 100) * 255);
  }
  const n = parseFloat(s);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(255, Math.round(n)));
}

function parseAlpha(s) {
  if (s.endsWith('%')) {
    const n = parseFloat(s);
    return Number.isFinite(n) ? n / 100 : 1;
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 1;
}

function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360 / 360;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h * 12) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return {
    r: Math.round(f(0) * 255),
    g: Math.round(f(8) * 255),
    b: Math.round(f(4) * 255),
  };
}

function toHex({ r, g, b, a = 1 }) {
  const h = (n) => n.toString(16).padStart(2, '0');
  const base = `#${h(r)}${h(g)}${h(b)}`;
  if (a < 1) return `${base}${h(Math.round(a * 255))}`;
  return base;
}

// sRGB (0-255) → Lab (CIE L*a*b*, D65)
function rgbToLab({ r, g, b }) {
  const linearize = (c) => {
    c = c / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const R = linearize(r);
  const G = linearize(g);
  const B = linearize(b);
  const X = R * 0.4124564 + G * 0.3575761 + B * 0.1804375;
  const Y = R * 0.2126729 + G * 0.7151522 + B * 0.0721750;
  const Z = R * 0.0193339 + G * 0.1191920 + B * 0.9503041;
  const Xn = 0.95047, Yn = 1.0, Zn = 1.08883;
  const f = (t) => t > 0.008856 ? Math.cbrt(t) : (7.787 * t + 16 / 116);
  const fx = f(X / Xn), fy = f(Y / Yn), fz = f(Z / Zn);
  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

// CIE76 ΔE — fast, good-enough for "are these two colors visually close?"
function deltaE(lab1, lab2) {
  const dL = lab1.L - lab2.L;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;
  return Math.sqrt(dL * dL + da * da + db * db);
}

// HSL components from RGB — for role classification.
function rgbToHsl({ r, g, b }) {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case R: h = ((G - B) / d + (G < B ? 6 : 0)); break;
      case G: h = ((B - R) / d + 2); break;
      case B: h = ((R - G) / d + 4); break;
    }
    h *= 60;
  }
  return { h, s, l };
}

function classifyRole({ r, g, b }) {
  const { h, s, l } = rgbToHsl({ r, g, b });
  if (l > 0.92) return 'background-light';
  if (l < 0.12) return 'background-dark';
  if (s < 0.12) return l > 0.55 ? 'neutral-light' : 'neutral-dark';
  if (s > 0.55 && l > 0.35 && l < 0.7) return 'brand-accent';
  if (s > 0.3) return 'brand';
  return 'neutral';
}

module.exports = {
  parseColor,
  toHex,
  rgbToLab,
  deltaE,
  rgbToHsl,
  classifyRole,
};
