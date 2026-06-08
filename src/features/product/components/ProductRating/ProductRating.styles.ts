// ProductRating — 1:1 port of the theme's `.rating` widget (component-rating.css, theme-css §15).
// The stars are a single `★★★★★` glyph string with a horizontal gradient fill: the filled portion
// is `#ff1b5c` up to `--percent`, the remainder is `--rating-star-bg` (rgba(35,35,35,0.15)). The
// fill percentage is computed by the caller and passed as the `--rating-percent` custom property,
// then painted by background-clip:text here. All arbitrary values live in this *.styles.ts (R4).

// `.rating` — inline wrapper.
export const ratingClass = 'rating inline-flex items-center';

// `.rating-star:before { content:'★★★★★'; background:linear-gradient(90deg, #ff1b5c var(--percent),
//   rgba(35,35,35,0.15) var(--percent)); -webkit-background-clip:text; color:transparent }`.
// The glyph itself is the `★★★★★` text node; the gradient is clipped to the text. 18px glyphs with
// a small letter-spacing so the five stars read as a row (matches the reference width).
export const starsClass =
  'rating-star inline-block text-[18px] leading-none tracking-[2px] ' +
  '[background:linear-gradient(90deg,#ff1b5c_var(--rating-percent),rgba(35,35,35,0.15)_var(--rating-percent))] ' +
  '[-webkit-background-clip:text] [background-clip:text] [-webkit-text-fill-color:transparent] [color:transparent]';

// `.rating-count.caption` — the "(N)" review count to the right of the stars (14px, muted).
export const countClass = 'rating-count ml-[8px] text-[14px] text-muted';
