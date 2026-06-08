import { cva } from 'class-variance-authority';

// Generic page (`main-page.liquid`) — no header image is set in config, so the theme falls through
// to the `custom_page_header` "no image" branch:
//   <div class="page-width"><div class="section-header"><h1 class="h2 page_header_heading">{title}</h1>
//   {breadcrumbs}</div></div>
// `.section-header` margin-bottom 35px → 55px (≥750px). H1 + breadcrumbs stacked.
export const pageHeaderClass = 'flex flex-col mb-[35px] md:mb-[55px]';

// `page_header_heading` is rendered with the `.h2` class (h2 visual scale). Bottom margin matches
// the theme heading rhythm (`h1,.h1{margin:0 0 17.5px}`).
export const pageHeadingClass = 'mb-[17.5px]';

// Page body: `.page-width > .grid > .grid__item.medium-up--five-sixths.medium-up--push-one-twelfth
// > .rte`. five-sixths ≈ 83.33% width pushed by one-twelfth ≈ 8.33% → a centered ~750px measure.
// The push centers the column; we reproduce with a centered max-width content well.
export const pageBodyClass = 'mx-auto w-full max-w-[750px]';

// `.rte` rich-text block: paragraph rhythm `p{margin:0 0 19.44px}`, body 16px / line-height 1.5 /
// color #232323. The RTE comes from `page.content` (server HTML) so it's injected, not typed.
export const pageRteClass =
  'text-[16px] leading-[1.5] text-text [&_p]:mb-[19.44px] [&_p:last-child]:mb-0 [&_strong]:font-bold';
