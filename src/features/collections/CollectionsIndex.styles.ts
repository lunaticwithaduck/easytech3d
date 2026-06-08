import { cva } from 'class-variance-authority';

export const pageVariants = cva('flex flex-col gap-6 py-8 md:gap-8 md:py-10');

// Title block under the breadcrumbs: the "Колекции" page heading, centered like the live store.
export const headingVariants = cva('text-center');

// 3-up desktop / 2 tablet / 1 mobile grid of collection cards (theme `grid: 3 / grid_mobile: 1`).
export const gridVariants = cva('grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3');
