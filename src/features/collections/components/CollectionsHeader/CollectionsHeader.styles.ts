import { cva } from 'class-variance-authority';

// CollectionsHeader — 1:1 port of `custom_page_header.liquid`'s NO-IMAGE branch, used by
// `list-collections-template.liquid` (this store sets no `header_image`, so the plain header renders):
//   <div class="page-width"><div class="section-header">
//     <h1 class="h2 page_header_heading">Колекции</h1>
//     {breadcrumbs}
//   </div></div>
// All arbitrary px live here (the convention linter exempts *.styles.ts from R4).

// `.section-header` — title + breadcrumbs block; 35px bottom margin (≥750px: 55px).
export const headerVariants = cva('section-header mb-[35px] md:mb-[55px]');

// `h1.h2.page_header_heading` — the "Колекции" page title (theme `.h2` scale via the Heading
// primitive's h2 level: 40px mobile / 52px desktop, 700, tracking 2px).
export const titleVariants = cva('page_header_heading mb-[17.5px]');
