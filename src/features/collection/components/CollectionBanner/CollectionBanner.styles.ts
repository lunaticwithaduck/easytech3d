import { cva } from 'class-variance-authority';

// CollectionBanner — 1:1 port of `snippets/custom_page_header.liquid` in `banner` mode
// (collection-template.liquid → collection_image_mode: 'banner'). The collection.image fills a
// 500px-tall well (the theme renders the header image at `image-style ... height: 500`), a solid
// `#000` scrim at the section's overlay opacity (settings: image_overlay_color #000 / opacity 40%)
// sits on top, and the page-width content (H1 title, breadcrumbs, filters toolbar) is positioned
// over the scrim. `#shopify-section-header` is absolutely positioned over this banner on the live
// site; in the port the chrome is a normal flow header, so the banner is a self-contained band.
// All arbitrary px/colors live here (the convention linter exempts *.styles.ts from R4).

// `.custom_page_header_section` — relative band, full-bleed image clipped to a 500px (lg) well.
export const bannerVariants = cva(
  'custom_page_header_section relative flex min-h-[320px] w-full items-end overflow-hidden md:min-h-[420px] lg:min-h-[500px]',
);

// The banner `<img>` — absolutely fills the band, `object-fit:cover` (image-style wrapper default).
export const bannerImageVariants = cva('object-cover');

// `.custom_page_header_opacity` — the overlay: `background:{overlay}; opacity:{N}%`. The theme's
// settings give #000 (black) at 40%. We paint a black layer and set its opacity; the exact
// per-record overlay opacity flows in via the `--overlay-opacity` custom property (R1 escape).
export const bannerOverlayVariants = cva(
  'custom_page_header_opacity absolute inset-0 bg-[#000] opacity-[var(--overlay-opacity)]',
);

// `.page-width` inside the banner — centered max-width content column over the scrim.
// page-width: max-width 1660px, padding 0 55px. The toolbar bottom margin inside the banner is
// removed (`.custom_page_header_section .custom_header-filters-toolbar-block { margin-bottom:0 }`).
export const bannerContentVariants = cva(
  'relative z-[1] mx-auto w-full max-w-[1660px] px-[20px] pb-[35px] md:px-[55px] md:pb-[50px]',
);

// `.section-header-wrapper-collection` over the banner — the title + product count, baseline-aligned.
export const bannerTitleBlockVariants = cva('flex flex-wrap items-baseline');

// `h1.h2.page_header_heading` — the collection title over the banner, white (sits on dark scrim).
// Visual scale is the theme `.h2` (40px mobile / 52px desktop, 700, 2px tracking — applied by the
// Heading primitive's h2 level); color is forced to white here because the banner text is inverse.
export const bannerTitleVariants = cva('page_header_heading mb-0 text-inverse');

// `.filters-toolbar__product-count` beside the title — white over the dark scrim (banner variant).
export const bannerCountVariants = cva(
  'filters-toolbar__product-count ml-[15px] whitespace-nowrap text-[16px] text-inverse opacity-80',
);

// Breadcrumbs inside the banner read white over the scrim (theme overrides the pink trail to white
// when it sits on the dark header image). Order in markup: title, then breadcrumbs, then toolbar.
export const bannerBreadcrumbsVariants = cva('mb-0 mt-[15px] text-inverse');
