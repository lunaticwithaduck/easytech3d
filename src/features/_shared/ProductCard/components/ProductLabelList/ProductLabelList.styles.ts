import { cva } from 'class-variance-authority';

// Product labels — 1:1 port of theme.css §9 + `snippets/product-card-item.liquid` (product_labels capture).
// Outlined pills (white bg, 2px colored border, colored text) positioned top-left of the card.
// All arbitrary px/colors live here (linter exempts *.styles.ts from R4).

// `.product-item__label-list { position:absolute; z-index:1; top:20px; left:20px; }`
export const labelListClass =
  'product-item__label-list absolute left-[20px] top-[20px] z-[1] flex';

// `.product-label { display:inline-block; padding:5px 15px; border-radius:20px; font-size:13px;
//   line-height:1; text-align:center; width:max-content; min-width:90px; background:#fff;
//   border:2px solid transparent; }`
// `.product-label + .product-label { margin-left:5px }` (gap between stacked labels).
const labelBase = [
  'product-label inline-block w-max min-w-[90px] rounded-[20px] border-2 bg-surface',
  'px-[15px] py-[5px] text-center text-[13px] leading-none',
  '[&+&]:ml-[5px]',
].join(' ');

export const labelVariants = cva(labelBase, {
  variants: {
    tone: {
      // `.product-label--on-sale { border-color:#00a500; color:#00a500 }` —
      // settings.product_label_sale_color = #00a500 (GREEN). The pill outline+text are green;
      // the price strike (separate, in PriceTag) is red #EA0606.
      onSale: 'product-label--on-sale border-[#00a500] text-[#00a500]',
      // `.product-label--soldout { border-color:#8a9297; color:#8a9297 }` —
      // settings.product_label_sold_out_color = #8a9297 (grey).
      soldOut: 'product-label--soldout border-[#8a9297] text-[#8a9297]',
    },
  },
});

export type LabelVariants = Parameters<typeof labelVariants>[0];
