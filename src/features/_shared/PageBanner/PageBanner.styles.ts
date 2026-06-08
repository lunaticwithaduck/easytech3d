import { cva } from 'class-variance-authority';

// 1:1 port of `snippets/custom_page_header.liquid` (the banner header used by blog / article /
// collection / cart / page / search). The image fills the band, a `#000` scrim sits over it at a
// per-section opacity, and the H1 (+ breadcrumbs + optional meta) overlays it inside a `.page-width`.
//
// Source markup:
//   <div class="custom_page_header_section …">
//     <img …>                          ← featured / header image, object-position: focal point
//     <div class="custom_page_header_opacity"></div>   ← overlay (bg #000, opacity {N}%)
//     <div class="page-width">
//       <h1 class="h2 page_header_heading">{heading}</h1>
//       {breadcrumbs}
//       {meta}
//     </div>
//   </div>
// theme.css: `.custom_page_header_section{ position:relative; }` — the image is the bed, the
// `.page-width` content is absolutely anchored to the bottom of the band (left-aligned title).
// All arbitrary px/values live here (R4 exempts *.styles.ts).

// The banner band: a relative, full-bleed well; the theme renders the header image at the section's
// natural height (~500px source crop) — we use a responsive aspect ratio so the title stays anchored.
export const bannerVariants = cva(
  'custom_page_header_section relative w-full overflow-hidden bg-text',
);

// Image bed — the featured/header image at `object-cover`, focal-point centered. `relative` so the
// `fill` Image positions against this well; the aspect ratio sets the band height.
export const bannerMediaVariants = cva('relative aspect-[16/7] w-full md:aspect-[1660/500]');

export const bannerImageVariants = cva('object-cover object-center');

// `.custom_page_header_opacity` — the `#000` scrim. Its opacity is per-section (40% on blog/article);
// supplied at runtime via the `--overlay-opacity` custom property so CVA never holds a record value.
export const bannerOverlayVariants = cva(
  'custom_page_header_opacity absolute inset-0 bg-text [opacity:var(--overlay-opacity)]',
);

// `.page-width` content overlay — absolutely anchored to the bottom-left of the band, capped at the
// 1660px theme page width with the 55px horizontal gutter (here the Container handles the cap).
export const bannerContentVariants = cva('absolute inset-x-0 bottom-0 z-[1] pb-8 md:pb-12');

// Inner stack: the H1, then breadcrumbs / meta. The heading is white (`page_header_heading`).
export const bannerInnerVariants = cva('flex flex-col gap-3');

// `.page_header_heading.h2` — the banner title renders with the theme's `.h2` scale in white.
export const bannerTitleVariants = cva('drop-shadow-md');
