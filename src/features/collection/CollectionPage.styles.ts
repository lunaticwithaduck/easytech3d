import { cva } from 'class-variance-authority';

// CollectionPage — 1:1 layout of `collection-template.liquid`. The banner header is full-bleed;
// the rest (toolbar/grid/description) lives inside the theme's `.page-width` container. All
// arbitrary px live here (the convention linter exempts *.styles.ts from R4).

// Vertical rhythm: the banner sits flush at the top, then a `.page-width` content column. The
// `.index-section` rhythm gives sections ~35px bottom padding; we add bottom padding to the page.
export const pageVariants = cva('pb-[35px]');

// `.page-width { max-width:1660px; margin:0 auto; padding:0 55px; }` (core.css) — the content
// container for the toolbar + grid + description (and the no-banner header). 20px gutters on mobile.
export const pageWidthVariants = cva('mx-auto w-full max-w-[1660px] px-[20px] md:px-[55px]');

// `#Collection` content wrapper — spacing between the (no-banner) header / grid / description.
export const collectionSectionVariants = cva('Collection_Section pt-[20px]');
