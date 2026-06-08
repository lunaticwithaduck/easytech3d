import { cva } from 'class-variance-authority';

// Responsive product grid: 1 column on mobile, 2 on tablet, 3 on desktop — the theme's
// `grid: 3 / grid_mobile: 1` setting for this store's collection template.
export const gridVariants = cva('grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3');

// Empty-collection notice centered in the grid area.
export const emptyVariants = cva('py-16 text-center');
