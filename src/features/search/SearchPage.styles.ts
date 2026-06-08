import { cva } from 'class-variance-authority';

// SearchPage — 1:1 port of `sections/search-page.liquid` for this store (no header image, so the
// theme renders the `<div class="text-center"><h1 class="h2">…</h1></div>` heading branch, a pill
// search form, then the `SearchGrid grid` of results). All arbitrary px live here (R4 exempts
// *.styles.ts). The page is wrapped by Section (white) + Container in SearchPage.tsx.

// `data-section-type="search-template"` root spacing — the section sits under the chrome with the
// theme's `.page-width` rhythm; the inner blocks carry their own vertical gaps.
export const pageClass = 'search-template flex flex-col';

// `.text-center > h1.h2` — the centered heading (title when idle, result-count line once a search
// runs). The heading itself uses the Heading primitive (real h2 ramp); this just centers + spaces it.
export const headingBlockClass = 'text-center';

// `.search-page-form` row sits under the heading with the theme's section breathing room.
export const formRowClass = 'mt-[35px] md:mt-[40px]';

// `.SearchGrid.grid` — the results grid. Faithful flexbox-style responsive grid: 1-up mobile →
// 2-up small → 3-up desktop (the store's `grid: 3` card layout), 11px-ish gutter via gap.
export const resultsGridClass =
  'SearchGrid mt-[55px] grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3';

// `.rte.search--no-results-found.text-center` — empty-state message block (no matches for the query).
export const noResultsClass =
  'search--no-results-found mt-[55px] flex flex-col items-center gap-[15px] text-center';

// The empty/no-results magnifier glyph (theme `icon-search-loop`), muted, centered above the copy.
export const noResultsIconClass = 'size-[56px] text-muted';

// Muted hint paragraph under the no-results / idle prompt.
export const noResultsHintClass = 'max-w-[480px]';
