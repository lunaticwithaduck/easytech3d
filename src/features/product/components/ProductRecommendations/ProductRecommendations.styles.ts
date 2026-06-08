// ProductRecommendations — 1:1 port of `sections/product-recommendations.liquid`
// (heading "You may also like" / live store "Може също да харесате…", grid_mobile 2 → cards show
// `small--one-half` on mobile). The section is a centered heading over the product carousel.

// `.product-recommendations__inner.half_row_mobile` — the band wrapper.
export const rootClass = 'product-recommendations__inner';

// `.section-header.text-center` — the centered "Може също да харесате…" title above the grid.
// The theme renders only an `<h2>` here (no eyebrow). 55px bottom margin (≥750px) per core.css.
export const headerClass = 'section-header mb-[35px] text-center md:mb-[55px]';
