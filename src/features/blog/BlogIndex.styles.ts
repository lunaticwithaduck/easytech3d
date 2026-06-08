import { cva } from 'class-variance-authority';

// Responsive article grid: 1-up on mobile, 2-up on small screens, 3-up on desktop — matching the
// Liquid `blog-template` grid (`mobile--one-whole small--one-half medium-up--one-third`).
export const gridVariants = cva('grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3');

// Empty-state wrapper shown when a blog has no articles yet.
export const emptyStateVariants = cva('py-16 text-center');
