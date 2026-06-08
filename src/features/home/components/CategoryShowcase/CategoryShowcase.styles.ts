import { cva } from 'class-variance-authority';

// CategoryShowcase — faithful port of the home `collection-list` section in carousel mode
// (sections/collection-list.liquid, section_style "carousel", image_style "circle").
// Flickity is replaced by CSS scroll-snap + custom circle arrows; every class name + px/colour
// value is reproduced 1:1 from theme.css. All arbitrary values live here (R4 exempts *.styles.ts).
//
// Source (theme.css §collection-list, SOURCE_INDEX §2 CollectionShowcase):
//   section.fade-in-animation.section_style_carousel.image_style_circle
//   .collection-grid-item { background:#fff; padding:40px 20px; border-radius:20px;
//                           position:relative; text-align:center; }      (theme.css 4065-4067 + 16)
//   @media(max-width:749px){ .collection-grid-item { padding:20px 15px } }
//   .image_style_circle .collection-grid-item img { border-radius:50%; width:120px; height:120px;
//                           margin-left:auto; margin-right:auto; }        (theme.css 4207-4217)
//   .collection-grid-item__image-wrapper-overlay { position:absolute; inset:0; }  (the dark overlay)
//   .collection-list__slide { padding:4px 4px 4px 0; overflow:hidden; }   (theme.css 4402-4416)
//   grid 5 → cell .medium-up--one-fifth tablet--one-quarter (20% desktop / 25% tablet)
//   .collection-grid-item__title.h4 — collection title under the circle
//   .collection-list__btn { min-width:270px }  (the primary CTA → /collections)
//   slider arrows: .slider_custom_arrows .btn.btn--circle-arrow (44px, handled by Button variant)

// `.section_content.carousel_section_content.without_image` (no bg image on the live home block).
export const showcaseRootClass =
  'section_content carousel_section_content without_image flex flex-col items-center gap-10';

// `.collection-list__slider.grid.grid--uniform` — the scroll track. Desktop: 5-up snap row;
// mobile (<=749px): horizontal overflow scroll with 85%-wide cells (theme max-width:749px rule:
// `.collection-list__slider .grid__item { width:85%; margin-right:11px }`). Scrollbar hidden.
export const trackClass = [
  // NOTE: the theme's bare `grid` class is dropped — it collides with Tailwind's `display:grid`
  // utility and would override the flex row below (the Warehouse "grid" is actually flexbox).
  'collection-list__slider grid--uniform',
  'flex w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth',
  // hide scrollbar (Flickity has none)
  '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
].join(' ');

// `.collection-list__slide.grid__item.medium-up--one-fifth.tablet--one-quarter`
//   theme: .collection-list__slide { padding:4px 4px 4px 0; overflow:hidden }
//   mobile (<=749px): width 85%, 11px right gutter.
//   tablet (750-1199px): one-quarter = 25%. desktop (>=1200px / medium-up): one-fifth = 20%.
export const slideClass = [
  'collection-list__slide grid__item medium-up--one-fifth tablet--one-quarter',
  'shrink-0 snap-start box-border overflow-hidden p-[4px_4px_4px_0]',
  // mobile: 85% wide, 11px right gutter
  'basis-[85%] min-w-[85%] mr-[11px]',
  // tablet (>=750px): 25% (one-quarter), drop the mobile right margin
  'min-[750px]:basis-1/4 min-[750px]:min-w-0 min-[750px]:mr-0',
  // wide desktop (>=1200px): 20% (one-fifth)
  'min-[1200px]:basis-1/5',
].join(' ');

// `.collection-grid-item` — white rounded card, centered, with the circle image + title.
//   background:#fff; padding:40px 20px (mobile 20px 15px); border-radius:20px; text-align:center.
export const tileClass = [
  'collection-grid-item group relative h-full flex flex-col items-center text-center',
  'bg-surface rounded-[20px] px-[15px] py-[20px] min-[750px]:px-[20px] min-[750px]:py-[40px]',
].join(' ');

// `.collection-grid-item__link` — wraps the circle image.
export const tileLinkClass = 'collection-grid-item__link block';

// `.collection-grid-item__image-wrapper` — the round image frame: 120×120, border-radius 50%,
// centered (mx-auto). Relative so the dark overlay can absolutely fill it.
export const imageWrapClass =
  'collection-grid-item__image-wrapper relative mx-auto block h-[120px] w-[120px] shrink-0 overflow-hidden rounded-full';

// the circle image itself — object-cover, scales subtly on hover (theme zoom-fade-animation-element).
export const imageClass =
  'zoom-fade-animation-element object-cover transition-transform duration-300 group-hover:scale-105';

// `.collection-grid-item__image-wrapper-overlay` — the dark tint over the circle image
//   theme: position:absolute; inset:0 (colour from settings; the live circle tile shows a dark veil).
export const imageOverlayClass =
  'collection-grid-item__image-wrapper-overlay pointer-events-none absolute inset-0 rounded-full bg-[rgba(35,35,35,0.25)]';

// `.collection-grid-item__info` + `.collection-grid-item__title.h4` — the collection title.
export const infoClass = 'collection-grid-item__info mt-[15px]';
export const titleClass = 'collection-grid-item__title leading-snug';

// `.slider_custom_arrows` — wraps the two circle-arrow buttons (theme: flex, align-center,
// margin-left:30px). On the live header they sit beside the title; here they centre under the
// carousel as a compact pair. Hidden on mobile (theme watchCSS/desktopHide on the desktop track).
export const arrowsClass = 'slider_custom_arrows hidden items-center gap-3 min-[750px]:flex';

// `.button-prev` / `.button-next` placement helpers (the 44px circle + colours come from the
// Button `circle-arrow` variant; here only the soft card shadow the theme gives slider arrows).
export const arrowVariants = cva('shadow-[0_0_4px_2px_var(--color-border)]', {
  variants: {
    direction: {
      prev: 'button-prev',
      next: 'button-next',
    },
  },
});

export type ArrowVariants = Parameters<typeof arrowVariants>[0];

// the leading/trailing arrow svg inside each circle button (theme `icon icon--tail-*`, 16px box).
export const arrowIconClass = 'icon size-4';

// `.collection-list__btn` — the primary CTA → /collections (theme min-width:270px).
export const ctaClass = 'collection-list__btn min-w-[270px]';
