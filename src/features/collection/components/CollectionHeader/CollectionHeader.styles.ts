import { cva } from 'class-variance-authority';

// CollectionHeader (no-banner path) — 1:1 port of the `.section-header` block rendered by
// `collection-template.liquid` when the collection has no banner image (the live `pla-filaments`
// page). All arbitrary px live here (the convention linter exempts *.styles.ts from R4).

// `.collection-header > .page-width > .section-header { margin-top:15px; }` (collection-page.css).
export const headerVariants = cva('section-header mt-[15px]');

// `.section-header-wrapper { display:flex; align-items:center; justify-content:space-between; }`
// (the live theme lays the title/count block and the filters toolbar side by side; wraps on mobile).
export const headerWrapperVariants = cva(
  'section-header-wrapper flex flex-wrap items-center justify-between gap-y-[20px]',
);

// `.section-header-wrapper-collection` — the title + product count, baseline-aligned.
export const titleBlockVariants = cva(
  'section-header-wrapper-collection flex flex-wrap items-baseline',
);

// `h1.h2` — the collection title (theme `.h2`: 40px mobile / 52px desktop, 700, tracking 2px; applied
// by the Heading primitive's h2 level). Sits left of the count.
export const titleVariants = cva('mb-0');

// `.filters-toolbar__product-count { font-size:16px; margin-left:15px; white-space:nowrap;
//   color:#888; }` (collection-page.css). Sits to the right of the title.
export const countVariants = cva(
  'filters-toolbar__product-count ml-[15px] whitespace-nowrap text-[16px] text-[#888]',
);
