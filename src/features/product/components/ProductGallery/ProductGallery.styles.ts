import { cva } from 'class-variance-authority';

// ProductGallery — 1:1 port of the media group in `sections/product-template.liquid`
// (`.product-single__media-group` → `.product-single__media__carousel` + `thumbnails-gallery`).
// media_size = medium → image stage height 530px; thumbnails_type = grid, thumbnails_size = 4 →
// a 4-column thumbnail grid. image zoom is on (a zoom affordance over the main image). All
// arbitrary px live here (R4 exempts *.styles.ts).

export const galleryRootClass = 'product-single__media-group-inner flex flex-col';

// `.product-single__media__carousel.product_image__zoom` — the main image stage. The theme sizes it
// by `height: {{ height }}` (530px for medium); white card surface, 20px radius, contain-fit image.
// `relative` + `group` so the zoom affordance can sit over it and react to hover.
export const mainStageClass =
  'product-single__media__carousel product_image__zoom group relative h-[420px] w-full overflow-hidden rounded-[20px] bg-surface min-[750px]:h-[530px]';

// `.product-single__media__slide` image — `object-fit:contain` centered, with a touch of padding so
// the photo breathes inside the white well.
export const mainImageClass = 'product-card__image object-contain p-[15px]';

// Zoom affordance over the main image (image zoom on). A small white circle in the top-right with
// the theme's zoom magnifier glyph; the theme opens photoswipe on click — here it is a static
// affordance indicating the image is zoomable.
export const zoomButtonClass =
  'absolute right-[15px] top-[15px] z-[1] flex size-[44px] items-center justify-center rounded-full bg-surface text-text shadow-[0_0_4px_2px_#ebebeb] transition-colors hover:bg-primary hover:text-inverse';

export const zoomIconClass = 'size-[16px]';

// `.thumbnails-wrapper .product-single__thumbnails.thumbnails-grid` — a 4-up grid of thumbnails
// below the main stage. The theme sets each thumbnail's width to `100% / thumbnails_size` (=25%);
// reproduced as a 4-column grid with the 11px-ish gutter, 15px top margin.
export const thumbsGridClass = 'thumbnails-wrapper mt-[15px] grid grid-cols-4 gap-[11px]';

// `.product-single__thumbnails-item` button — a square white thumbnail well, 10px radius; the active
// one gets the brand-primary 2px border (the theme's `is-active` thumbnail state).
export const thumbButtonVariants = cva(
  'product-single__thumbnails-item relative aspect-square w-full overflow-hidden rounded-[10px] border-2 bg-surface transition-colors',
  {
    variants: {
      active: {
        true: 'border-primary',
        false: 'border-border hover:border-primary',
      },
    },
    defaultVariants: { active: false },
  },
);

export const thumbImageClass = 'object-contain p-[6px]';
