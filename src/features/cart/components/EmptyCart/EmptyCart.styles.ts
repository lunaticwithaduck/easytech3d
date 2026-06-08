import { cva } from 'class-variance-authority';

// `.empty-page-content.text-center` — the centered empty-cart column (icon, title, message, CTA).
// The Liquid wraps this in `.empty-page-content { padding:125px 0 }`; we soften it a touch since the
// banner heading already sits above. Mirrors the live capture's centered stack.
export const emptyRootClass = 'flex flex-col items-center gap-5 py-[60px] text-center';

// Soft circular badge holding the theme cart glyph (a friendly affordance over the bare text).
export const emptyIconWrapClass =
  'flex size-20 items-center justify-center rounded-full bg-surface text-muted';

export const emptyIconClass = 'w-[34px]';

// `.cart--empty-message` — constrains the message line so it wraps tidily under the title.
export const emptyMessageClass = 'max-w-sm';

// `.btn span + svg { margin-left:15px }` — the trailing tail-right arrow on the CTA button.
export const ctaIconClass = 'ml-[15px] w-4';
