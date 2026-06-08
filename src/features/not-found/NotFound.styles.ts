import { cva } from 'class-variance-authority';

// `main-404.liquid` → `<div class="page-width-small"><div class="empty-page-content text-left
// page-404-content">…</div></div>`. `.page-width-small` max 1280px, padding 0 55px;
// `.empty-page-content` padding 125px 0. Left-aligned content.
export const notFoundWrapperClass = 'mx-auto w-full max-w-[1280px] px-[55px] py-[125px] text-left';

// Suptitle `<h3>` ("Страницата не е намерена ;("): h3 visual scale (26 → 40px, calc 0.8 → 32px),
// weight 700, color #232323. Heading rhythm `h3{margin:0 0 17.5px}`.
export const notFoundSuptitleClass = 'mb-[17.5px]';

// `<h1 class="mega-title--large mega-title">` ("Страница 404") — the big pink numeral title.
// `.mega-title--large` = `(--font-size-header + 20)/16 * 1em`; on this store header base is 40 →
// ≈60px effective, but the live render is a large pink heading (~100px on wide). Use the mega scale
// (h1 desktop 80px, scaled up) and recolor to primary #ff1b5c (text-primary). Heading line-height 1.
export const notFoundTitleClass =
  'text-primary leading-none text-[56px] md:text-[80px] lg:text-[100px] mb-[17.5px]';

// `.btn_wrapper` — the two CTAs in a row (wrap on narrow). Spacing between the title and buttons
// comes from the empty-page-content rhythm; buttons sit inline with a gap.
export const notFoundActionsClass = 'flex flex-wrap items-center gap-[15px] mt-[35px]';

// `.page-404-footer` — copyright line below the buttons (`<small class="site-footer__copyright-content">`).
export const notFoundFooterClass = 'mt-[55px] text-[14px] text-muted';
