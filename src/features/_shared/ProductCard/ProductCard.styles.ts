import { cva } from 'class-variance-authority';
import { headingVariants } from '@/design-system/primitives/Heading/Heading.styles';

// ProductCard — 1:1 port of `snippets/product-card-item.liquid` + theme.css §7.
// All arbitrary px/colors live here (the convention linter exempts *.styles.ts from R4).

// Outer block: `.zoom-fade-animation-element-wrapper .grid__item .product-item-block .view-mode-grid`.
//   theme.css §7: `.product-item-block { margin-bottom: 30px; }`
export const blockClass = 'product-item-block view-mode-grid mb-[30px]';

// Inner card surface: `.product-card.product-card-wrapper`.
//   theme.css §7: `.product-card { padding:20px; border-radius:20px; background:#fff;
//   position:relative; height:100%; display:flex; flex-direction:column; transition:all .3s; }`
export const cardVariants = cva(
  'product-card product-card-wrapper relative flex h-full flex-col rounded-[20px] bg-surface p-[20px] [transition:all_.3s]',
);

// Media region: `.product-item--media`. The image area uses the theme's `--product-image-height`
// (settings.collection_height = 200px, align_height mode) with `object-fit:contain` + 15px bottom.
//   `.use_align_height .product-card .product-card__image-with-placeholder-wrapper {
//     min/max-height: var(--product-image-height); margin-bottom:15px; }`
export const mediaClass = 'product-item--media';

// `.product-card__image-with-placeholder-wrapper` — fixed 200px tall image box, 15px bottom margin.
export const imageBoxClass =
  'product-card__image-with-placeholder-wrapper relative mb-[15px] h-[200px]';

// `a.list-view-item__link-image.product-card__link-image` wraps the image; block-level full width.
export const imageLinkClass = 'list-view-item__link-image product-card__link-image block h-full';

// `.list-view-item__image-wrapper.product-card__image-wrapper` — centers the image in the box.
export const imageWrapperClass =
  'list-view-item__image-wrapper product-card__image-wrapper relative mx-auto block h-full w-full';

// `img.list-view-item__image.product-card__image` — `object-fit:contain; max-height:200px; width:100%`.
//   (theme: `.use_align_height .product-card img { object-fit:contain; max-height:var(...); width:100% }`)
export const imageClass = 'list-view-item__image product-card__image object-contain';

// Info region: `.product-item--info`. Holds vendor, title link, price row, and the pinned CTA.
export const infoClass = 'product-item--info flex flex-1 flex-col';

// `a.product-item__vendor.link` — small vendor link above the title.
export const vendorClass = 'product-item__vendor link mb-[5px] block text-[14px] text-muted';

// `a.item__link-title.product-card__link-title` — the title anchor (wraps the h4 title span).
export const titleLinkClass = 'item__link-title product-card__link-title block';

// `span.h4.item__title.product-card__title` — the title renders as a <span> carrying the theme's
// `.h4` heading style (22px desktop / 19px mobile, weight 700, letter-spacing 1px, Instrument Sans,
// color #232323). We reuse the Heading primitive's h4 level classes so the visual scale is identical
// to a real <h4> while keeping the span element the theme uses inside the title anchor.
export const titleClass = `item__title product-card__title ${headingVariants({ level: 'h4' })}`;

// `.product-item__price_and_reviews_row` — flex space-between, `margin: 20px 0 10px 0` (theme.css §7).
export const priceRowClass =
  'product-item__price_and_reviews_row mx-0 mb-[10px] mt-[20px] flex flex-wrap items-center justify-between';

// `form.product-item__action-list` — `margin-top:auto` pins the CTA to the card bottom (theme.css §7).
export const actionListClass = 'product-item__action-list button-stack mt-auto flex flex-col';

// `.product-card .product-item__action-list .btn { margin-top:10px; width:100% }` — full-width CTA.
export const addButtonClass = 'mt-[10px] w-full justify-center';

// Cart icon inside the CTA — `.btn span + svg { margin-left:15px }` (theme.css). 16px box.
export const cartIconClass = 'ml-[15px] size-4';
