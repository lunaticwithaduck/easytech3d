import { cva } from 'class-variance-authority';

// Centered 404 stack. Generous y-padding gives the message vertical breathing room without the
// footer crowding it (the shared Section already supplies its own band padding around this).
export const notFoundWrapperClass =
  'flex flex-col items-center justify-center gap-6 py-12 text-center md:py-24 lg:py-32';

// "Mega" 404 numeral. text-7xl…9xl come from Tailwind's default scale (the theme only overrides
// up to text-6xl, so these named utilities still resolve) — no arbitrary values needed.
export const notFoundCodeClass =
  'font-sans text-7xl font-bold leading-none text-primary md:text-8xl lg:text-9xl';

// The eyebrow above the numeral — small, upper-cased, brand-tinted.
export const notFoundEyebrowClass = 'uppercase tracking-wider';

// Constrains the supporting message so long BG copy wraps to a pleasant measure.
export const notFoundMessageClass = 'max-w-prose';

// Row of CTAs — wraps to a column on the narrowest screens.
export const notFoundActionsClass = 'flex flex-wrap items-center justify-center gap-3';
