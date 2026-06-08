import { cva } from 'class-variance-authority';

// The whole card surface is the product link: a white panel that lifts on hover. Border softens to
// the brand `primary` and a subtle shadow appears, matching the reference grid's hover affordance.
export const cardVariants = cva(
  'group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-background text-left transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-lg',
);

// Square media well above the info block; the image fills it and scales in slightly on hover.
export const mediaVariants = cva('relative aspect-square w-full overflow-hidden bg-paper');

export const imageVariants = cva(
  'object-contain transition-transform duration-300 group-hover:scale-105',
);

// Sale flag pinned to the media's top-left corner, mirroring the Liquid `product-item__label-list`.
export const saleBadgeVariants = cva(
  'absolute left-3 top-3 z-10 rounded-button bg-sale px-2 py-1 text-inverse',
);

// Title + price stack beneath the media.
export const infoVariants = cva('flex flex-1 flex-col gap-2 p-4');

export const titleVariants = cva('line-clamp-2 group-hover:text-primary');
