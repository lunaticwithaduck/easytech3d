// AddToCart — 1:1 port of the `quantity_block` + `product_buttons` blocks in
// `sections/product-template.liquid` (+ cart-page.css `.QuantitySelector`, theme-css §14).
// All arbitrary px/colors live here (R4 exempts *.styles.ts).

// Vertical stack: quantity row, then the submit button (mobile-sticky parent).
export const rootClass = 'product-form__controls-group flex flex-col gap-[20px]';

// `.form_bg_row.quantity_block > .qty_container` — the labelled quantity row.
export const quantityRowClass = 'quantity_block flex flex-col gap-[10px]';

// `label.header` — "Количество:" label above the stepper (14px, weight 700).
export const quantityLabelClass = 'header text-[14px] font-bold text-text';

// `.QuantitySelector` — cart-page.css: `bg var(--color-body); border-radius:50px; width:120px;
// padding:9px 15px`. A pill segmented control: minus / value / plus.
export const stepperClass =
  'QuantitySelector inline-flex w-[120px] items-center justify-between rounded-[50px] bg-background px-[15px] py-[9px]';

// `.qty_btn` (minus_btn / plus_btn) — square hit-area, muted glyph that pinks on hover.
export const stepperButtonClass =
  'qty_btn flex size-[20px] items-center justify-center text-text transition-colors hover:text-primary disabled:opacity-40';

export const stepperIconClass = 'size-[10px]';

// `.product-form__input--quantity` — the current quantity value (cart-page.css: font-weight:600,
// font-size:18px), centered between the two buttons.
export const stepperValueClass = 'text-center text-[18px] font-semibold text-text';

// `.product-form__controls-group--submit` — the add-to-cart button row. On mobile this becomes a
// sticky bottom bar (`product-form-sticky-parent` + `enabled_mobile_sticky_btns`); on ≥750px it is a
// normal in-flow full-width button.
export const submitRowClass =
  'product-form__controls-group--submit ' +
  'max-[749px]:fixed max-[749px]:inset-x-0 max-[749px]:bottom-0 max-[749px]:z-[200] max-[749px]:border-t max-[749px]:border-border max-[749px]:bg-surface max-[749px]:p-[15px]';

// `.btn.product-form__cart-submit.btn--primary` — full-width pink pill. The Button primitive already
// applies the `.btn--primary` surface (radius 50px, padding 13/20/13/23, hover #e70042 reveal);
// here we just stretch it full width and center its label+icon.
export const submitButtonClass = 'product-form__cart-submit w-full justify-center';

// Cart icon inside the CTA — `.btn span + svg { margin-left:15px }`. 18px box.
export const cartIconClass = 'ml-[15px] size-[18px]';
