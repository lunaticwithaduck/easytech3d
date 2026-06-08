// Design tokens — single source of truth. Derived from the easytech3d.com reference
// (tools/output/design-tokens/tokens.json). `colors` and `radius` are flat string maps so
// scripts/generate-theme.cjs can regex-parse them into Tailwind v4 `@theme` custom properties.
// Keep every value a flat string literal — nested objects are silently dropped by the generator.

export const colors = {
  background: '#ffffff',
  elevated: '#f4f4f4',
  paper: '#ebebeb',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  text: '#232323',
  muted: '#60646c',
  inverse: '#ffffff',
  primary: '#ff1b5c',
  secondary: '#f4f4f4',
  accent: '#fd5b2a',
  destructive: '#ea0606',
  success: '#16795b',
  warning: '#b68a0b',
  border: '#e4e4e4',
  ring: '#ff1b5c',
} as const;

export type ColorToken = keyof typeof colors;
export type ColorValue = (typeof colors)[ColorToken];

// px values straight from the reference; full = pill.
export const radius = {
  none: '0',
  sm: '3px',
  md: '10px',
  lg: '20px',
  xl: '50px',
  button: '10px',
  full: '9999px',
} as const;

export const zIndex = {
  base: 0,
  raised: 10,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  toast: 500,
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export type Breakpoint = keyof typeof breakpoints;
