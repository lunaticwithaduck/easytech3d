// Design tokens — EXACT values extracted from the live theme's resolved :root variables
// (see .claude/scout / tools settings extraction). `colors` and `radius` are flat string maps so
// scripts/generate-theme.cjs can regex-parse them into Tailwind v4 `@theme` custom properties.

export const colors = {
  // surfaces
  background: '#f4f4f4', // --color-body / --color-bg (the page is light grey, NOT white)
  surface: '#ffffff', // cards, fields (--color-text-field)
  elevated: '#ffffff',
  paper: '#ffffff',
  backdrop: 'rgba(35, 35, 35, 0.4)', // image/overlay scrim (--opacity-image-overlay 0.4)
  // text
  text: '#232323', // --color-text / --color-body-text
  muted: '#6e6e6e',
  inverse: '#ffffff', // --color-btn-primary-text / on-dark text
  // brand
  primary: '#ff1b5c', // --color-btn-primary
  'primary-dark': '#e70042', // --color-btn-primary-darker (hover/focus)
  secondary: '#3a3a3a', // --color-btn-secondary
  accent: '#ff1b5c',
  // status
  destructive: '#ea0606',
  sale: '#ea0606', // --color-sale-text
  success: '#16795b',
  warning: '#b68a0b',
  // lines
  border: '#ebebeb', // --color-border
  'border-form': '#cccccc', // --color-border-form
  ring: '#ff1b5c',
} as const;

export type ColorToken = keyof typeof colors;
export type ColorValue = (typeof colors)[ColorToken];

// Exact theme radii: pill buttons 50px, cards 20px, media/dropdowns 10px, inputs 2px.
export const radius = {
  none: '0',
  sm: '2px', // default inputs
  md: '10px', // blog/media cards, dropdowns, logo tiles
  lg: '20px', // product/collection cards, labels
  button: '50px', // pill buttons + pill (cart/search/footer) inputs
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
