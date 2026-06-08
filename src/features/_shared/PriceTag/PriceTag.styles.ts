import { cva } from 'class-variance-authority';

// `.price` — the price wrapper. Theme rule: `.product-item__price_and_reviews_row .price`
// `{ font-weight: bold }`. The bold is carried by the inner <TextPrice> (weight="bold");
// here we own only layout. `.price__pricing-group { display:flex; flex-direction:row;
// align-items:center }` from core.css.
export const priceVariants = cva('flex flex-row items-center font-bold');

// `.price__sale` group (shown when `.price--on-sale`): core.css gives it
// `{ width:100%; display:flex; flex-direction:row; flex-wrap:wrap; align-items:center }`.
export const saleGroupVariants = cva('flex w-full flex-row flex-wrap items-center');

// `.price-item--sale { margin-right: 10px }` (theme.css) — the sale price sits to the LEFT of
// the struck compare-at price, with a 10px gap. (Arbitrary px lives here; .styles.ts is
// exempt from the R4 no-arbitrary-value rule.)
export const salePriceVariants = cva('mr-[10px]');

// `.price--on-sale .price-item--regular { text-decoration: line-through; opacity:.6 }` —
// the compare-at price rendered inside `<s>`, struck through and muted.
export const compareAtVariants = cva('line-through opacity-60');
