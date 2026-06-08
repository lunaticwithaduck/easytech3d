// Type scale — anchored at base 16px, mirroring the reference's ladder. The generator emits
// `fontSize` as Tailwind v4 `--text-*` custom properties so `text-base`, `text-lg`, … resolve.

export const fontSize = {
  '2xs': '0.8125rem', // 13px
  xs: '0.875rem', // 14px
  sm: '0.9375rem', // 15px
  base: '1rem', // 16px
  lg: '1.125rem', // 18px
  xl: '1.25rem', // 20px
  '2xl': '1.375rem', // 22px
  '3xl': '1.5rem', // 24px
  '4xl': '1.75rem', // 28px
  '5xl': '2rem', // 32px
  '6xl': '2.25rem', // 36px
} as const;

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const lineHeight = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
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
