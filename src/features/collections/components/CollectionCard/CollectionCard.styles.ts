import { cva } from 'class-variance-authority';

// CollectionCard — 1:1 port of `snippets/collections-grid-item.liquid` in `full_image` display mode
// (list-collections-template.liquid → collection_grid_display: 'full_image'). theme.css §16:
//   .collection-grid-item { background:#fff; padding:30px; border-radius:20px; text-align:center; }
//   .collection-grid-item.full_image { padding:0; }
//   .collection-grid-item.full_image img { border-radius:20px 20px 0 0; }
// All arbitrary px/colors live here (the convention linter exempts *.styles.ts from R4).

// `.collection-grid-item.full_image` — white card, 20px radius, full-bleed image (padding:0).
export const cardVariants = cva(
  'collection-grid-item full_image relative flex h-full flex-col overflow-hidden rounded-[20px] bg-surface text-center',
);

// `.collection-grid-item__image-with-placeholder-wrapper > .collection-grid-item__link >
//   .collection-grid-item__image-wrapper` — the media well. full_image: image fills the top with
// rounded top corners. The card image height tracks the theme's collection image (~300px well).
export const mediaVariants = cva(
  'collection-grid-item__image-wrapper relative block h-[300px] w-full overflow-hidden rounded-t-[20px] bg-surface',
);

// `img.zoom-fade-animation-element` — full_image cover fill (object-fit:cover).
export const imageVariants = cva('object-cover');

// `.collection-grid-item__info.collections-grid-item__info` — title + count + browse button block.
//   theme.css: `.collection-grid-item__button_wrapper { margin-top:50px; }` (mobile 20px).
export const infoVariants = cva(
  'collection-grid-item__info collections-grid-item__info flex flex-1 flex-col items-center px-[20px] py-[20px]',
);

// `.collection-grid-item__title.h3 > a` — the collection title link (theme `.h3` scale via Heading).
export const titleVariants = cva('collection-grid-item__title');

// `.collection-grid-item-products-count > span` — "N продукти".
//   theme.css: `.collection-grid-item-products-count { margin-top:10px; }`
export const countVariants = cva('collection-grid-item-products-count mt-[10px] text-text');

// `.collection-grid-item__button_wrapper { margin-top:50px; } .btn { width:100% }` — the
// full-width dark "Разгледай" (btn--secondary) at the foot of the card.
export const buttonWrapperVariants = cva(
  'collection-grid-item__button_wrapper mt-auto w-full pt-[50px] max-[749px]:pt-[20px]',
);

// `.collection-grid-item__button_wrapper .btn { width:100% }` — full-width secondary pill.
export const buttonVariants = cva('w-full');

// The `.btn` trailing arrow (`<span> + {tail-right}` with `.btn span + svg { margin-left:15px }`).
export const buttonIconClass = 'ml-[15px] inline-block size-4';
