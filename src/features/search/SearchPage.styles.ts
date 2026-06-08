// Centered header column: eyebrow + heading + form, stacked with breathing room.
export const headerClass = 'flex flex-col items-center gap-4 text-center';

// Wraps the on-page search form so it centers under the heading.
export const formRowClass = 'mt-2 flex w-full justify-center';

// Result count line sits left-aligned above the grid once a search has run.
export const resultCountClass = 'mt-10 mb-6';

// 1-up mobile → 2-up small → 3-up desktop product grid (collection rhythm).
export const productGridClass = 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3';

// Empty / no-results panel: centered icon, title, hint, and a browse CTA.
export const emptyStateClass = 'mt-12 flex flex-col items-center gap-4 text-center';

export const emptyIconClass = 'text-muted';

// Muted hint paragraph under empty-state titles.
export const emptyHintClass = 'max-w-md';

export const emptyCtaClass = 'mt-2';
