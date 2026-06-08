import { cva } from 'class-variance-authority';

// `.QuantitySelector` (cart-page.css §14): the qty pill — `background: var(--color-body)` (#f4f4f4),
// `border-radius:50px`, `width:120px`, `margin:0 auto`, `padding:9px 15px`. The minus/value/plus
// controls sit on one row, space-between. Mobile shrinks to width 110px / padding 6px 10px.
export const stepperRootClass =
  'QuantitySelector mx-auto flex w-[120px] items-center justify-between rounded-[50px] bg-background py-[9px] px-[15px] max-[749px]:w-[110px] max-[749px]:py-[6px] max-[749px]:px-[10px]';

// `.QuantitySelector__Button` — the minus/plus tap targets. Pink links (Link--primary) in the
// theme; we keep them text-colored with a pink hover and clamp the glyph box small.
export const stepperButtonClass =
  'flex shrink-0 items-center justify-center text-text transition-colors hover:text-primary disabled:opacity-40 disabled:hover:text-text';

// `.QuantitySelector__CurrentQuantity { font-weight:600; font-size:18px }`.
export const stepperValueClass = 'min-w-[20px] select-none text-center text-[18px] font-semibold';

// minus glyph (viewBox 0 0 10 2 — wide & short) sized to the theme tap target.
export const minusIconClass = 'w-[12px]';

// plus glyph (viewBox 0 0 10 10 — square).
export const plusIconClass = 'w-[12px]';
