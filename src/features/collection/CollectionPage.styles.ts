import { cva } from 'class-variance-authority';

// Vertical rhythm for the collection page: breadcrumbs, banner, toolbar, grid, description.
export const pageVariants = cva('flex flex-col gap-6 py-8 md:gap-8 md:py-10');

// When a collection has no banner image we fall back to a plain heading block (breadcrumbs are
// rendered separately above). The title sits large like the live store's `section-header`.
export const headingBlockVariants = cva('flex flex-col gap-1');
