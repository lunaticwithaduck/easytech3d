import { cva } from 'class-variance-authority';
import { headingVariants } from '@/design-system/primitives/Heading/Heading.styles';

// ProductPage — 1:1 port of `sections/product-template.liquid` for this store's settings
// (media_size = medium → media `medium-up--one-half` / desc `medium-up--one-half`, image height 530;
// thumbnails grid size 4; image zoom on; mobile sticky buttons on). All arbitrary px/colors live
// here (the convention linter exempts *.styles.ts from R4).

// Vertical spacing around the breadcrumb trail at the top of the PDP.
export const breadcrumbsClass = 'py-[20px]';

// `<div class="page-width-small">` — the PDP container (max-width 1280px, padding 0 55px, centered).
// core.css: `.page-width-small { max-width:1280px; margin:0 auto; padding:0 55px; }`. The 55px side
// padding collapses to the responsive container padding on small screens.
export const pageWidthSmallClass = 'mx-auto w-full max-w-[1280px] px-4 sm:px-6 min-[750px]:px-[55px]';

// `.grid.product-single.product-single--medium-media` — the two-column split. core.css grid is
// flexbox (margin-left -11px gutter); reproduced as a 11px-gutter flex row. Stacks below 750px
// (`small--*` = full width), splits 50/50 at `medium-up--` (≥750px).
export const productSingleClass =
  'product-single -ml-[11px] flex flex-wrap items-start';

// `.grid__item.product-single__media-group.medium-up--one-half` — left media column. width:100%
// + padding-left:11px (the grid gutter); 50% at ≥750px.
export const mediaGroupClass =
  'product-single__media-group grid__item w-full pl-[11px] min-[750px]:w-1/2';

// `.grid__item.medium-up--one-half` — right info column. Same gutter; 50% at ≥750px.
export const infoColumnClass = 'grid__item w-full pl-[11px] min-[750px]:w-1/2';

// `.product-single__meta` — the buy-box stack (vendor → title → rating → price → options → qty →
// buttons). On mobile a touch of top spacing separates it from the gallery.
export const metaClass = 'product-single__meta mt-[30px] min-[750px]:mt-0';

// `p.product_sku` — small SKU line above the title. `.product_sku { font-size:14px; color:#6e6e6e }`.
export const skuClass = 'product_sku text-[14px] text-muted';

// `.price__vendor` — vendor link/name above the title (small, muted, uppercase like the reference).
export const vendorClass = 'price__vendor block text-[14px] uppercase tracking-[0.5px] text-muted';

// `h1.product-single__title.h3` — the product title. The theme renders the H1 with the `.h3`
// heading style (40px desktop / 26px mobile via the Heading h3 ramp). We reuse the Heading h3 level
// classes on the H1 so semantics (h1) and the theme's visual scale (.h3) both hold.
export const titleClass = `product-single__title ${headingVariants({ level: 'h3' })}`;

// `.product__price` block wrapper. The price sits its own row; the tax note follows beneath.
export const priceBlockClass = 'product__price';

// `.product__policies.rte` — "ДДС Включено." note under the price (14px, muted).
export const taxNoteClass = 'product__policies mt-[5px] text-[14px] text-muted';

// `.rte.product-single__description.full_product-single__description` — full-width description that
// renders below the two-column block (product_description block, desc_display = full_width).
// Styled-prose child selectors give paragraphs/lists/headings the theme's rhythm.
export const descriptionClass =
  'rte product-single__description full_product-single__description mt-[40px] max-w-none text-text [&_a]:text-primary [&_a]:underline [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_li]:mb-1 [&_p]:mb-4 [&_p]:leading-relaxed [&_strong]:font-bold [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5';

// Vertical rhythm between buy-box blocks (vendor/title/rating/price/options/qty/buttons). The theme
// spaces these via per-block margins + `.form_bg_row` rows; a 20px gap reproduces that cadence.
export const metaStackClass = 'flex flex-col gap-[20px]';

// Top + bottom spacing for the related "Може също да харесате…" band. The theme's
// product-recommendations section sits in the page flow with its own section header spacing.
export const recommendationsSectionClass = 'mt-[55px] mb-[35px]';
