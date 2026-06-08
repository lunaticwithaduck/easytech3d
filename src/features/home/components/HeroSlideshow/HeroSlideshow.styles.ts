import { cva } from 'class-variance-authority';

// HeroSlideshow — 1:1 port of the live theme's FADE slideshow (sections/slideshow.liquid,
// data-section-type="slideshow-section"; theme.Slideshow / theme.SlideshowSection).
// Real settings: slideshow_height "small", slideshow_mobile_height "medium", text_size "large",
// slideshow_width "full", autorotate 6s, dots + circle arrows.
//
// CRITICAL custom_css on the section: `@media (max-width:750px){.slideshow{display:none}}` —
// the hero is HIDDEN below 750px. We replicate that (the slideshow renders only `min-[750px]`)
// and show a simpler stacked first-slide banner on mobile.
//
// All arbitrary px / colors / tracking live here so the rest of the codebase stays token-clean
// (the convention linter exempts *.styles.ts from R4). Per-slide dynamic values (overlay opacity,
// bg-image focal position) are passed by the component as inline CSS custom properties (R1 escape).

/* -------------------------------------------------------------------------- */
/* WRAPPER                                                                     */
/* -------------------------------------------------------------------------- */

// `.slideshow-section-wrapper` (slideshow_width "full" → no page-width). Full-bleed.
export const sectionWrapperClass = 'slideshow-section-wrapper relative w-full';

// `#SlideshowWrapper-{id}.slideshow-wrapper[role=region]`.
export const slideshowWrapperClass = 'slideshow-wrapper relative w-full focus:outline-none';

// `.slideshow.slideshow--small.mobile-slideshow--medium` — the track. Theme height "small"
// renders ~520px on desktop. HIDDEN below 750px (custom_css), shown from the 750px breakpoint.
export const slideshowTrackClass =
  'slideshow slideshow--small mobile-slideshow--medium relative hidden w-full overflow-hidden min-[750px]:block min-[750px]:h-[520px]';

/* -------------------------------------------------------------------------- */
/* SLIDE (fade)                                                                */
/* -------------------------------------------------------------------------- */

// `.slideshow__slide(.slideshow__slide--active)` — absolutely stacked, cross-faded. Type "fade"
// (theme.Slideshow): only the active slide is opaque; CSS does the cross-fade. No transform.
export const slideVariants = cva(
  'slideshow__slide absolute inset-0 transition-opacity duration-[600ms] ease-in-out',
  {
    variants: {
      active: {
        true: 'slideshow__slide--active z-[1] opacity-100',
        false: 'pointer-events-none z-0 opacity-0',
      },
    },
    defaultVariants: { active: false },
  },
);

// `.slideshow__image_wrapper > img.slideshow__image.box` — full-bleed cover image.
export const imageWrapperClass = 'slideshow__image_wrapper absolute inset-0 h-full w-full';
export const imageClass = 'slideshow__image box h-full w-full object-cover [object-position:var(--focal,center)]';

// `.slideshow__overlay` + `::before` — the dimming layer. Color is #000 (theme block default
// color_image_overlay "#000"); the opacity is per-slide via the `--overlay-opacity` CSS var the
// component sets inline. Default falls back to 40% (the schema's image_overlay_opacity default).
export const overlayClass =
  'slideshow__overlay pointer-events-none absolute inset-0 z-[1] bg-black [opacity:var(--overlay-opacity,0.4)]';

/* -------------------------------------------------------------------------- */
/* TEXT BLOCK                                                                  */
/* -------------------------------------------------------------------------- */

// `.slideshow__text-wrap.slideshow__text-wrap--desktop` over the image (above overlay).
export const textWrapClass = 'slideshow__text-wrap slideshow__text-wrap--desktop absolute inset-0 z-[2]';

// `.slideshow__text-content.slideshow__text-content--vertical-{v}.text-{h}` — alignment driven
// per-slide. Base is a full-height flex column; the vertical/horizontal variants position it.
export const textContentVariants = cva(
  'slideshow__text-content flex h-full w-full flex-col',
  {
    variants: {
      vertical: {
        top: 'slideshow__text-content--vertical-top justify-start pt-[8%]',
        center: 'slideshow__text-content--vertical-center justify-center',
        bottom: 'slideshow__text-content--vertical-bottom justify-end pb-[8%]',
      },
      horizontal: {
        left: 'text-left items-start',
        center: 'text-center items-center',
        right: 'text-right items-end',
      },
    },
    defaultVariants: { vertical: 'center', horizontal: 'left' },
  },
);

// `.page-width-small` — max-width 1280px, padding 0 55px, centered.
export const pageWidthSmallClass = 'page-width-small mx-auto w-full max-w-[1280px] px-[55px]';

// `.slideshow__text-content-list` — the title/subtitle stack.
export const textContentListClass = 'slideshow__text-content-list flex max-w-[760px] flex-col gap-[18px]';

// `.slideshow__title.h1.mega-title.mega-title--large` — large hero heading (text_size "large" →
// mega-title--large, ~80px desktop, white). Color/inverse + tracking come from the Heading
// primitive's h1 level; we drop its bottom margin so it sits in the flex stack.
export const titleClass = 'slideshow__title mega-title mega-title--large !mb-0 text-inverse';

// `.slideshow__subtitle.mega-subtitle.mega-subtitle--large` — ~24px white intro line.
export const subtitleClass = 'slideshow__subtitle mega-subtitle mega-subtitle--large text-[24px] leading-[1.3] text-inverse';

// `.slideshow__btn-wrapper.slideshow__btn-wrapper--push` — CTA row, pushed below the text.
export const btnWrapperClass = 'slideshow__btn-wrapper slideshow__btn-wrapper--push mt-[30px] flex flex-wrap gap-[15px]';

// `.slideshow__btn` modifier on the .btn (geometry comes from the Button primitive).
export const slideBtnClass = 'slideshow__btn';

/* -------------------------------------------------------------------------- */
/* CONTROLS (dots + circle arrows)                                             */
/* -------------------------------------------------------------------------- */

// `.slideshow__controls.page-width-small` — overlaid bottom band carrying dots + arrows.
export const controlsClass =
  'slideshow__controls page-width-small pointer-events-none absolute inset-x-0 bottom-[30px] z-[3] mx-auto flex max-w-[1280px] items-center justify-between px-[55px]';

// `ul.slick-dots` — the dot rail.
export const dotsListClass = 'slick-dots pointer-events-auto flex list-none items-center gap-[8px] p-0';

// `li[data-slider-indicator]` wrapper.
export const dotItemClass = 'slick-dots__item';

// Dot button: 65×4px pill, radius 20px; inactive #e4e4e4, active #ff1b5c (slider dot spec).
export const dotVariants = cva(
  'block h-[4px] w-[65px] cursor-pointer rounded-[20px] border-0 p-0 transition-colors',
  {
    variants: {
      active: {
        true: 'slick-active bg-primary',
        false: 'bg-[#e4e4e4] hover:bg-[#cfcfcf]',
      },
    },
    defaultVariants: { active: false },
  },
);

// `.slideshow__arrows` — the prev/next circle-arrow pair.
export const arrowsClass = 'slideshow__arrows pointer-events-auto flex items-center gap-[10px]';

// `.slideshow__arrow.btn--circle-arrow` modifier (geometry from Button variant circle-arrow).
export const arrowClass = 'slideshow__arrow';

// Circle-arrow icon sizing (matches the 15px svg the theme renders inside .btn).
export const arrowIconClass = 'size-4';

/* -------------------------------------------------------------------------- */
/* MOBILE (stacked first-slide banner, shown only below 750px)                */
/* -------------------------------------------------------------------------- */

// The slideshow is hidden <750px; we render a single stacked banner of the first slide instead.
export const mobileBannerClass = 'relative block h-[360px] w-full overflow-hidden min-[750px]:hidden';

export const mobileContentClass =
  'absolute inset-0 z-[2] flex flex-col items-start justify-center gap-[14px] px-[22px]';

export const mobileTitleClass = '!mb-0 text-inverse';

export const mobileSubtitleClass = 'text-[16px] leading-[1.4] text-inverse';
