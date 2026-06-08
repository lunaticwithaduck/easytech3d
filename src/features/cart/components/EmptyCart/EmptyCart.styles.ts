import { cva } from 'class-variance-authority';

// Centered empty-state column: icon, message, CTA — mirrors the live cart's empty layout.
export const emptyRootClass = 'flex flex-col items-center gap-5 py-12 text-center';

// Soft circular badge holding the cart icon.
export const emptyIconWrapClass =
  'flex size-20 items-center justify-center rounded-full bg-elevated text-muted';

// Constrains the message line so it wraps tidily under the icon.
export const emptyMessageClass = 'max-w-sm';
