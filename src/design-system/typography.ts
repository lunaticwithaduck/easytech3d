// Typography — EXACT scale from the live theme.
// Fonts: header/body = Instrument Sans, navigation = Archivo Narrow.
// Heading sizes are responsive (desktop / mobile px) with per-level letter-spacing, weight 700.

// Body / rich-text sizes (the generator emits these as Tailwind `--text-*`).
export const fontSize = {
  '2xs': '0.75rem', // 12
  xs: '0.8125rem', // 13
  sm: '0.875rem', // 14  (rich-text small)
  base: '1rem', // 16  (--font-size-base)
  lg: '1.125rem', // 18  (rich-text large / h5)
  xl: '1.375rem', // 22  (h4)
  '2xl': '1.625rem', // 26  (h3 mobile)
  '3xl': '2.5rem', // 40  (h3 desktop / generic header)
  '4xl': '3.25rem', // 52  (h2 desktop)
  '5xl': '3.5rem', // 56  (h1 mobile)
  '6xl': '5rem', // 80  (h1 desktop)
} as const;

// Exact responsive heading scale (the Heading component applies these).
export const headings = {
  h1: { mobile: '3.5rem', desktop: '5rem', tracking: '0.125rem', weight: 700 }, // 56 / 80, 2px
  h2: { mobile: '2.5rem', desktop: '3.25rem', tracking: '0.125rem', weight: 700 }, // 40 / 52, 2px
  h3: { mobile: '1.625rem', desktop: '2.5rem', tracking: '0.0625rem', weight: 700 }, // 26 / 40, 1px
  h4: { mobile: '1.1875rem', desktop: '1.375rem', tracking: '0.0625rem', weight: 700 }, // 19 / 22, 1px
  h5: { mobile: '1.125rem', desktop: '1.125rem', tracking: '0.03125rem', weight: 700 }, // 18, 0.5px
  h6: { mobile: '0.875rem', desktop: '1rem', tracking: '0.03125rem', weight: 700 }, // 14 / 16, 0.5px
} as const;

export type HeadingLevel = keyof typeof headings;

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const lineHeight = {
  none: '1',
  tight: '1.15',
  snug: '1.3',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
} as const;

export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
} as const;

export type FontSize = keyof typeof fontSize;
export type FontWeight = keyof typeof fontWeight;
export type LineHeight = keyof typeof lineHeight;
export type LetterSpacing = keyof typeof letterSpacing;
