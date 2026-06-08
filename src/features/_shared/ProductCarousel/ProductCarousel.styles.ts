import { cva } from 'class-variance-authority';

// ProductCarousel — faithful port of the featured-products Flickity carousel
// (sections/featured-products.liquid + theme.css). Flickity is replaced by CSS
// scroll-snap + a ref that scrolls one page; the DOM/classnames and every px/colour
// value are reproduced 1:1. All arbitrary values live here (*.styles.ts is R4-exempt).
//
// Source values (theme.css / SOURCE_INDEX §2 FeaturedProducts):
//   flickity_options = { prevNextButtons:false, wrapAround:true, dragThreshold:15,
//                        watchCSS:true, cellAlign:left, pauseAutoPlayOnHover:true,
//                        autoPlay:speed*1000|false, pageDots:show_dots, groupCells:grid(4) }
//   cell width: .medium-up--one-quarter => 25% (Flickity renders 22% inside the row); 4-up desktop.
//   mobile (<=749px): slider becomes display:flex; overflow-x:auto; each card width:75%
//                     min-width:75% margin-right:22px; padding-bottom:20px; margin-bottom:-20px.
//   dots: .flickity-page-dots{ position:relative; padding-top:20px; text-align:left }
//         .dot{ display:inline-block; width:65px; height:4px; margin:0 5px; border-radius:20px }
//         inactive #e4e4e4 / active #ff1b5c.
//   arrows: .slider_custom_arrows .btn.btn--circle-arrow => 44px circle, #fff bg, #8d8d8d,
//           hover #ff1b5c bg / #fff icon (handled by the Button `circle-arrow` variant).

// `.index-tabs-collections-wrapper.section_main_content` — relative so the side arrows anchor to it.
export const carouselRootClass = 'index-tabs-collections-wrapper section_main_content relative';

// `.index-tabs-content_block` (the active tab panel).
export const carouselPanelClass = 'index-tabs-content_block active relative';

// `.index-tabs-content_block__slider` — the scroll track. Desktop: snap row, 4-up; mobile
// (<=749px): horizontal overflow scroll, 75%-wide cells (matches theme's max-width:749px rules).
// Scrollbar hidden (theme hides it; drag + arrows + dots are the affordance).
export const carouselTrackClass = [
  'index-tabs-content_block__slider',
  'flex w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth',
  // mobile track: theme adds padding-bottom:20px; margin-bottom:-20px
  'pb-[20px] mb-[-20px]',
  // hide scrollbar (Flickity has no scrollbar)
  '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
].join(' ');

// `.product-item-block` cell. Desktop = one-quarter (25%) → 4-up, with the grid's 11px left
// gutter (.grid__item{padding-left:11px}). Mobile (<=749px) = 75% width + 22px right gutter +
// snap-start so each card pages to its left edge (theme: width:75%; min-width:75%; margin-right:22px).
export const carouselItemClass = [
  'product-item-block view-mode-grid medium-up--one-quarter',
  'shrink-0 snap-start box-border',
  // mobile: 75% wide, 22px right gutter (last child gutter trimmed by the track gap math below)
  'basis-[75%] min-w-[75%] pr-[22px]',
  // desktop (>=750px): one-quarter (25%) cells with the 11px grid gutter; arrows/dots replace scroll
  'min-[750px]:basis-[25%] min-[750px]:min-w-[25%] min-[750px]:pr-0 min-[750px]:pl-[11px]',
].join(' ');

// `.slider_custom_arrows` — wraps the two circle-arrow buttons. On the real theme they sit at the
// top-right of the section header; here we float them at the vertical centre of the track edges
// (desktop only — mobile uses native horizontal scroll, theme hides arrows via watchCSS/desktopHide).
export const carouselArrowsClass = 'slider_custom_arrows';

// `.button-prev` / `.button-next .btn.btn--circle-arrow` positioned over the track sides.
// The 44px circle / colours / hover come from the Button `circle-arrow` variant; here we only
// place them. Hidden below the desktop breakpoint (theme disables Flickity arrows on mobile).
export const carouselArrowVariants = cva(
  'absolute top-1/2 z-[2] hidden -translate-y-1/2 shadow-[0_0_4px_2px_var(--color-border)] min-[750px]:inline-flex',
  {
    variants: {
      direction: {
        // .button-prev
        prev: 'button-prev left-[-22px]',
        // .button-next
        next: 'button-next right-[-22px]',
      },
    },
  },
);

export type CarouselArrowVariants = Parameters<typeof carouselArrowVariants>[0];

// the trailing/leading arrow svg inside each circle button: theme `icon icon--tail-*`, 16px box.
export const carouselArrowIconClass = 'icon size-4';

// `.flickity-page-dots` — relative, 20px top padding, left aligned (.index-tabs-collections-wrapper
// override). Only shown on desktop where the paged carousel is active.
export const carouselDotsClass =
  'flickity-page-dots relative hidden list-none pt-[20px] text-left min-[750px]:block';

// `.flickity-page-dots .dot` <li> wrapper — inline-block with the 0 5px horizontal margin
// (theme: .dot{ display:inline-block; margin:0 5px }). The 65×4px pill itself is the inner button.
export const carouselDotItemClass = 'dot inline-block mx-[5px] p-0 leading-none';

// the clickable 65×4px pill, radius 20px. Inactive #e4e4e4 / active (.is-selected) #ff1b5c.
// (Exact values per SOURCE_INDEX §1.6.)
export const carouselDotVariants = cva(
  'block h-[4px] w-[65px] cursor-pointer rounded-[20px] [transition:background-color_.3s]',
  {
    variants: {
      selected: {
        true: 'is-selected bg-[#ff1b5c]',
        false: 'bg-[#e4e4e4]',
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
);

export type CarouselDotVariants = Parameters<typeof carouselDotVariants>[0];
